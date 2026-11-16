#pragma once
#import <AVFoundation/AVFoundation.h>
#include "../sound_bank.hpp"

class Sound {
    AVAudioEngine *engine;
    AVAudioPlayerNode *music, *voices[8], *layers[2], *accent;
    AVAudioUnitVarispeed *rates[2];
    AVAudioPCMBuffer *drive[4];
    bool boosting=false;
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
        auto bank=[[AVAudioFile alloc] initForReading:[NSBundle.mainBundle URLForResource:@"ion-drive" withExtension:@"flac"] error:error];
        if(!bank)return false;
        constexpr double cuts[]={0,4,8,8.95,10.05};
        for(int i=0;i<4;i++){
            drive[i]=segment(bank,cuts[i],cuts[i+1],error);
            if(!drive[i])return false;
        }
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
        accent=[AVAudioPlayerNode new];
        [engine attachNode:accent];
        [engine connect:accent to:engine.mainMixerNode format:bank.processingFormat];
        for(int i=0;i<2;i++){
            layers[i]=[AVAudioPlayerNode new];
            rates[i]=[AVAudioUnitVarispeed new];
            [engine attachNode:layers[i]]; [engine attachNode:rates[i]];
            [engine connect:layers[i] to:rates[i] format:bank.processingFormat];
            [engine connect:rates[i] to:engine.mainMixerNode format:bank.processingFormat];
            [layers[i] scheduleBuffer:drive[i] atTime:nil options:AVAudioPlayerNodeBufferLoops completionHandler:nil];
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
        [accent stop];boosting=false;
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
        rates[0].rate=.92+.14*flow;
        rates[1].rate=.90+.13*flow+.09*thrust;
        layers[0].volume=.63-.39*thrust;
        layers[1].volume=.72*thrust*thrust;
        if((!boosting && thrust>.43) || (boosting && thrust<.20)){
            boosting=!boosting;
            [accent stop];accent.volume=boosting?.63:.47;
            [accent scheduleBuffer:drive[boosting?2:3] completionHandler:nil];
            [accent play];
        }
    }
    void cue(neon::Cue c,double strength) {
        if (!engine.running || muted)
            return;
        auto voice = voices[nextVoice++ % 8];
        [voice stop];
        voice.volume=c==neon::Cue::Fire?.42:c==neon::Cue::Rail?.22+.32*strength:c==neon::Cue::Hit?.36+.55*strength:.72;
        [voice scheduleBuffer:tones[int(c)] completionHandler:nil];
        [voice play];
    }
};
