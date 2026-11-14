#pragma once
#include "sound.hpp"
#include "tone.hpp"
#ifdef __APPLE__
#define AL_SILENCE_DEPRECATION
#include <OpenAL/al.h>
#include <OpenAL/alc.h>
#else
#include <AL/al.h>
#include <AL/alc.h>
#endif

class AudioSink {
    ALCdevice* device = nullptr;
    ALCcontext* context = nullptr;
    ALuint buffers[3]{}, sources[3]{};
public:
    AudioSink() {
        device = alcOpenDevice(nullptr);
        if (!device) return;
        context = alcCreateContext(device,nullptr);
        if (!context || !alcMakeContextCurrent(context)) return;
        alGenBuffers(3,buffers);
        alGenSources(3,sources);
        for (int i = 0; i < 3; ++i) {
            auto pcm = tone(static_cast<Cue>(i));
            alBufferData(buffers[i], AL_FORMAT_MONO16, pcm.data(),
                         static_cast<ALsizei>(pcm.size()*sizeof(pcm[0])), sampleRate);
            alSourcei(sources[i], AL_BUFFER, buffers[i]);
        }
    }
    AudioSink(const AudioSink&) = delete;
    AudioSink& operator=(const AudioSink&) = delete;

    void play(SoundEvents events) {
        if (!context || alcGetCurrentContext() != context) return;
        if (events.pickup) alSourcePlay(sources[0]);
        if (events.latch) alSourcePlay(sources[1]);
        if (events.lift) alSourcePlay(sources[2]);
    }

    ~AudioSink() {
        if (context && alcGetCurrentContext() == context) {
            alDeleteSources(3,sources);
            alDeleteBuffers(3,buffers);
            alcMakeContextCurrent(nullptr);
        }
        if (context) alcDestroyContext(context);
        if (device) alcCloseDevice(device);
    }
};
