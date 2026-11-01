export type SoundKind = "rain" | "ocean" | "whitenoise";

type AudioContextConstructor = typeof AudioContext;

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;
let currentLfo: OscillatorNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const Ctor: AudioContextConstructor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: AudioContextConstructor }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function startSound(kind: SoundKind, volume = 0.5) {
  stopSound();
  const ctx = getCtx();

  const source = ctx.createBufferSource();
  source.buffer = makeNoiseBuffer(ctx);
  source.loop = true;

  const gain = ctx.createGain();
  gain.gain.value = volume;

  const filter = ctx.createBiquadFilter();

  if (kind === "whitenoise") {
    filter.type = "lowpass";
    filter.frequency.value = 6000;
    source.connect(filter);
    filter.connect(gain);
  } else if (kind === "rain") {
    filter.type = "highpass";
    filter.frequency.value = 1200;
    source.connect(filter);
    filter.connect(gain);
  } else {
    // ocean: low rumble with a slow wave-like swell in volume
    filter.type = "lowpass";
    filter.frequency.value = 350;
    source.connect(filter);
    filter.connect(gain);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = volume * 0.35;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    currentLfo = lfo;
  }

  gain.connect(ctx.destination);
  source.start();

  currentSource = source;
  currentGain = gain;
}

export function stopSound() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // already stopped
    }
    currentSource.disconnect();
    currentSource = null;
  }
  if (currentLfo) {
    try {
      currentLfo.stop();
    } catch {
      // already stopped
    }
    currentLfo.disconnect();
    currentLfo = null;
  }
  if (currentGain) {
    currentGain.disconnect();
    currentGain = null;
  }
}

export function setVolume(volume: number) {
  if (currentGain) {
    currentGain.gain.value = volume;
  }
}
