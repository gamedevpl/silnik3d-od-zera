#pragma once
#import <AVFoundation/AVFoundation.h>
#include "../sound_bank.hpp"

class Sound {
    AVAudioEngine *engine;
    AVAudioPlayerNode *music, *voices[8], *layers[2];
    AVAudioUnitVarispeed *rates[2];
    AVAudioPCMBuffer *tones[neon::audio::count];
    int nextVoice = 0;
    AVAudioPCMBuffer *segment(AVAudioFile *file, double from, double until, NSError **error) {
        double rate = file.processingFormat.sampleRate;
        file.framePosition = llround(from * rate);
        auto frames =
            std::min<AVAudioFramePosition>(file.length, llround(until * rate)) - file.framePosition;
        if (frames <= 0)
            return nil;
        auto b =
            [[AVAudioPCMBuffer alloc] initWithPCMFormat:file.processingFormat frameCapacity:frames];
        return [file readIntoBuffer:b error:error] ? b : nil;
    }
    bool setup(NSError **error) {
        auto file = [[AVAudioFile alloc]
            initForReading:[NSBundle.mainBundle URLForResource:@"vibe-score" withExtension:@"mp3"]
                     error:error];
        if (!file)
            return false;
        auto intro = segment(file, 0, 48, error), loop = segment(file, 16, 48, error);
        if (!intro || !loop)
            return false;
        engine = [AVAudioEngine new];
        music = [AVAudioPlayerNode new];
        [engine attachNode:music];
        [engine connect:music to:engine.mainMixerNode format:file.processingFormat];
        [music scheduleBuffer:intro completionHandler:nil];
        [music scheduleBuffer:loop
                       atTime:nil
                      options:AVAudioPlayerNodeBufferLoops
            completionHandler:nil];
        music.volume = .78;
        auto fmt = [[AVAudioFormat alloc] initStandardFormatWithSampleRate:neon::audio::rate channels:1];
        for (auto &v : voices) {
            v = [AVAudioPlayerNode new];
            [engine attachNode:v];
            [engine connect:v to:engine.mainMixerNode format:fmt];
        }
        for(int id=0;id<neon::audio::count;id++){
            const auto &samples=neon::audio::clip(id);
            auto b=[[AVAudioPCMBuffer alloc] initWithPCMFormat:fmt frameCapacity:samples.size()];
            b.frameLength=b.frameCapacity;
            std::copy(samples.begin(),samples.end(),b.floatChannelData[0]);
            tones[id]=b;
        }
        for(int i=0;i<2;i++){
            layers[i]=[AVAudioPlayerNode new];
            rates[i]=[AVAudioUnitVarispeed new];
            [engine attachNode:layers[i]]; [engine attachNode:rates[i]];
            [engine connect:layers[i] to:rates[i] format:fmt];
            [engine connect:rates[i] to:engine.mainMixerNode format:fmt];
            [layers[i] scheduleBuffer:tones[neon::audio::turbine+i] atTime:nil options:AVAudioPlayerNodeBufferLoops completionHandler:nil];
            layers[i].volume=0;
        }
        return true;
    }

  public:
    bool muted = false;
    bool play(NSError **error) {
        if (!engine && !setup(error))
            return false;
        engine.mainMixerNode.outputVolume = muted ? 0 : .48;
        if (![engine startAndReturnError:error])
            return false;
        for(auto layer:layers)[layer play];
        [music play];
        return true;
    }
    void pause() {
        for(auto layer:layers)[layer pause];
        [music pause];
        for (auto &v : voices)
            [v stop];
        [engine pause];
    }
    void toggle() {
        muted = !muted;
        engine.mainMixerNode.outputVolume = muted ? 0 : .48;
    }
    void power(double speed,double thrust) {
        double flow=std::min(1.25,speed/82.);
        rates[0].rate=.63+.83*flow+.17*thrust;
        rates[1].rate=.68+.55*flow;
        layers[0].volume=.12+.13*thrust;
        layers[1].volume=.016+.19*flow*flow;
    }
    void cue(neon::Cue c) {
        if (!engine.running || muted)
            return;
        auto voice = voices[nextVoice++ % 8];
        [voice stop];
        voice.volume=c==neon::Cue::Fire?.42:c==neon::Cue::Rail?.39:.72;
        [voice scheduleBuffer:tones[int(c)] completionHandler:nil];
        [voice play];
    }
};
