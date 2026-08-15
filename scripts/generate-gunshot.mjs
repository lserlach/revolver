import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 44100;
const duration = 1.15;
const length = Math.floor(sampleRate * duration);

function clamp(value) {
  return Math.max(-1, Math.min(1, value));
}

function writeWav(path, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(Math.round(clamp(samples[i]) * 32767), 44 + i * 2);
  }

  writeFileSync(path, buffer);
}

const samples = new Float64Array(length);
let noise = 0;

for (let i = 0; i < length; i += 1) {
  const t = i / sampleRate;
  noise = noise * 0.35 + (Math.random() * 2 - 1) * 0.65;

  const crack = (Math.random() * 2 - 1) * Math.exp(-t * 90);
  const snap = Math.sin(2 * Math.PI * (2200 - t * 1600) * t) * Math.exp(-t * 55) * 0.35;
  const boom =
    Math.sin(2 * Math.PI * (95 + t * 18) * t) * Math.exp(-t * 5.2) * 0.72 +
    Math.sin(2 * Math.PI * 48 * t) * Math.exp(-t * 3.8) * 0.38;
  const body = noise * Math.exp(-t * 7.5) * 0.42;
  const echo1 = i > Math.floor(sampleRate * 0.055) ? samples[i - Math.floor(sampleRate * 0.055)] * 0.28 : 0;
  const echo2 = i > Math.floor(sampleRate * 0.13) ? samples[i - Math.floor(sampleRate * 0.13)] * 0.16 : 0;
  const echo3 = i > Math.floor(sampleRate * 0.24) ? samples[i - Math.floor(sampleRate * 0.24)] * 0.08 : 0;

  let mix = crack * 0.55 + snap + boom + body + echo1 + echo2 + echo3;
  mix = clamp(mix * 1.35);
  mix = mix + mix * Math.abs(mix) * 0.35;
  samples[i] = clamp(mix);
}

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sounds", "bang.wav");
writeWav(out, samples);
console.log("wrote", out);
