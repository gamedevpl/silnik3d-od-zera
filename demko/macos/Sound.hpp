#pragma once
#import <AVFoundation/AVFoundation.h>
#include "../sound_bank.hpp"
#include <atomic>
#include <memory>

class Sound {
    AVAudioEngine *engine;
    AVAudioPlayerNode *music, *voices[8];
    std::shared_ptr<std::atomic<float>> thrustTarget=std::make_shared<std::atomic<float>>(0);
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
        auto cruise=segment(bank,0,4,error);
        if(!cruise)return false;
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
        // Run the pulse on the audio clock so its phase survives frame-rate changes.
        auto target=thrustTarget;
        const double rate=cruise.format.sampleRate, smoothing=1-std::exp(-1/(.10*rate));
        const double cadenceSmoothing=1-std::exp(-1/(.42*rate));
        const AVAudioFrameCount length=cruise.frameLength;
        __block AVAudioFrameCount cursor=0;
        __block double thrust=0, cadence=0, phase=0;
        auto drive=[[AVAudioSourceNode alloc] initWithFormat:cruise.format
            renderBlock:^OSStatus(BOOL *, const AudioTimeStamp *, AVAudioFrameCount frames, AudioBufferList *out){
                const double requested=target->load(std::memory_order_relaxed);
                auto samples=cruise.floatChannelData;
                for(AVAudioFrameCount i=0;i<frames;i++){
                    thrust+=(requested-thrust)*smoothing;
                    const double amount=.15*thrust;
                    const float gain=.63-amount+amount*std::sin(phase);
                    for(UInt32 c=0;c<out->mNumberBuffers;c++)
                        static_cast<float *>(out->mBuffers[c].mData)[i]=gain*samples[c][cursor];
                    cadence+=(requested-cadence)*cadenceSmoothing;
                    phase+=neon::tau*(1.25+2.75*cadence)/rate;
                    if(phase>=neon::tau)phase-=neon::tau;
                    if(++cursor==length)cursor=0;
                }
                return noErr;
            }];
        [engine attachNode:drive];
        [engine connect:drive to:engine.mainMixerNode format:cruise.format];
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
        [music play];
        return true;
    }
    void pause() {
        thrustTarget->store(0,std::memory_order_relaxed);
        [music pause];
        for (auto &v : voices)
            [v stop];
        [engine pause];
    }
    void toggle() {
        muted = !muted;
        engine.mainMixerNode.outputVolume = muted ? 0 : .48;
    }
    void power(double thrust) {
        thrustTarget->store(float(thrust),std::memory_order_relaxed);
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
