import type { SoundName } from "../types";

export type KeyKind = "key" | "space" | "big";

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function setup() {
  context ??= new AudioContext();
  if (!noise) {
    noise = context.createBuffer(1, context.sampleRate * 0.5, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return { context, noise };
}

// small random changes, so a hundred key presses don't sound like one sample on repeat
const vary = (value: number, amount = 0.08) => value * (1 + (Math.random() * 2 - 1) * amount);

// noise through a filter that fades out fast. most of a key sound is this
function burst(type: BiquadFilterType, frequency: number, q: number, volume: number, length: number, delay = 0) {
  const { context, noise } = setup();
  const start = context.currentTime + delay;

  const source = context.createBufferSource();
  source.buffer = noise;
  const filter = context.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = vary(frequency);
  filter.Q.value = q;
  const gain = context.createGain();
  gain.gain.setValueAtTime(vary(volume, 0.15), start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start, Math.random() * 0.4);
  source.stop(start + length);
}

// the low knock of the keyboard case
function knock(frequency: number, volume: number, length: number) {
  const { context } = setup();
  const start = context.currentTime;

  const oscillator = context.createOscillator();
  oscillator.frequency.setValueAtTime(vary(frequency), start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.6, start + length);
  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + length);
}

export function playPress(sound: SoundName, kind: KeyKind) {
  // the space bar and big keys are lower and ring a bit longer
  const deep = kind === "space" ? 0.6 : kind === "big" ? 0.8 : 1;

  if (sound === "thock") {
    burst("lowpass", 700 * deep, 0.8, 1.6, 0.07 / deep);
    burst("bandpass", 280 * deep, 3, 2.2, 0.05 / deep);
    burst("highpass", 4000, 0.7, 0.12, 0.006);
    knock(170 * deep, 0.22, 0.05);
  } else if (sound === "clicky") {
    burst("bandpass", 4500, 4, 1.4, 0.012);
    burst("bandpass", 2400, 1.5, 0.7, 0.03, 0.02);
    burst("lowpass", 1200 * deep, 0.8, 0.8, 0.05 / deep, 0.02);
    knock(260 * deep, 0.08, 0.035);
  }
}

// the softer sound when the key springs back up
export function playRelease(sound: SoundName) {
  if (sound === "thock") burst("bandpass", 1500, 1.5, 0.35, 0.025);
  else if (sound === "clicky") burst("bandpass", 3800, 3, 0.6, 0.012);
}
