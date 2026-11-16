#pragma once
#import <AVFoundation/AVFoundation.h>
#include "../race.hpp"
#include <atomic>
#include <memory>

class Sound {
    AVAudioEngine *engine;
    AVAudioPlayerNode *music, *voices[8];
    AVAudioPCMBuffer *tones[8];
    std::shared_ptr<std::atomic<float>> throttle = std::make_shared<std::atomic<float>>(0);
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
        auto fmt = [[AVAudioFormat alloc] initStandardFormatWithSampleRate:48000 channels:1];
        for (auto &v : voices) {
            v = [AVAudioPlayerNode new];
            [engine attachNode:v];
            [engine connect:v to:engine.mainMixerNode format:fmt];
        }
        struct Sweep {
            double start, end, seconds, gain;
            int wave;
        };
        const Sweep sweeps[] = {{680, 150, .115, .24, 0}, {135, 650, .36, .19, 1},
                                {210, 39, .28, .32, 1},   {120, 34, .36, .40, 2},
                                {640, 1180, .17, .22, 3}, {160, 95, .09, .11, 0},
                                {160, 46, .32, .20, 1},   {440, 880, .36, .19, 0}};
        for (unsigned k = 0; k < 8; k++) {
            auto s = sweeps[k];
            auto b = [[AVAudioPCMBuffer alloc] initWithPCMFormat:fmt
                                                   frameCapacity:llround(s.seconds * 48000)];
            b.frameLength = b.frameCapacity;
            double phase = 0;
            for (unsigned i = 0; i < b.frameLength; i++) {
                double t = double(i) / b.frameLength;
                phase += s.start * pow(s.end / s.start, t) / 48000;
                double p = phase - floor(phase);
                double wave = s.wave == 0   ? 1 - 4 * fabs(p - .5)
                              : s.wave == 1 ? 2 * p - 1
                              : s.wave == 2 ? (p > .5 ? 1 : -1)
                                            : sin(neon::tau * p);
                b.floatChannelData[0][i] = s.gain * wave * std::min(1., i / 336.) * exp(-6 * t);
            }
            tones[k] = b;
        }
        auto shared = throttle;
        __block double phase = 0, filtered = 0;
        auto motor = [[AVAudioSourceNode alloc]
            initWithFormat:fmt
               renderBlock:^OSStatus(BOOL *, const AudioTimeStamp *, AVAudioFrameCount count,
                                     AudioBufferList *out) {
                 float power = shared->load(std::memory_order_relaxed);
                 for (unsigned i = 0; i < count; i++) {
                     phase += (48 + 52 * power) / 48000.;
                     phase -= floor(phase);
                     filtered += (2 * phase - 1 - filtered) *
                                 (1 - exp(-neon::tau * (140 + 400 * power) / 48000));
                     for (unsigned ch = 0; ch < out->mNumberBuffers; ch++)
                         static_cast<float *>(out->mBuffers[ch].mData)[i] =
                             filtered * (.049 + .028 * power);
                 }
                 return noErr;
               }];
        [engine attachNode:motor];
        [engine connect:motor to:engine.mainMixerNode format:fmt];
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
        [music pause];
        for (auto &v : voices)
            [v stop];
        [engine pause];
    }
    void toggle() {
        muted = !muted;
        engine.mainMixerNode.outputVolume = muted ? 0 : .48;
    }
    void power(float v) { throttle->store(v, std::memory_order_relaxed); }
    void cue(neon::Cue c) {
        if (!engine.running || muted)
            return;
        auto voice = voices[nextVoice++ % 8];
        [voice stop];
        [voice scheduleBuffer:tones[int(c==neon::Cue::Launch ? neon::Cue::Pad : c==neon::Cue::Wreck ? neon::Cue::Break : c)] completionHandler:nil];
        [voice play];
    }
};
