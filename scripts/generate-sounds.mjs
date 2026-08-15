import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const soundsDir = join(root, "public", "sounds");
const sampleRate = 44100;

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
    const value = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(value * 32767), 44 + i * 2);
  }

  writeFileSync(path, buffer);
}

function clickSamples() {
  const length = Math.floor(sampleRate * 0.09);
  const samples = new Float64Array(length);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 70);
    const metal =
      Math.sin(2 * Math.PI * 2350 * t) * 0.42 +
      Math.sin(2 * Math.PI * 3720 * t) * 0.22 +
      Math.sin(2 * Math.PI * 1180 * t) * 0.12;
    const noise = (Math.random() * 2 - 1) * 0.18 * Math.exp(-t * 90);
    samples[i] = (metal + noise) * env;
  }
  return samples;
}

function bangSamples() {
  const length = Math.floor(sampleRate * 0.55);
  const samples = new Float64Array(length);
  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const boomEnv = Math.exp(-t * 6.5);
    const crackEnv = Math.exp(-t * 28);
    const boom =
      Math.sin(2 * Math.PI * (90 + t * 40) * t) * 0.55 +
      Math.sin(2 * Math.PI * 48 * t) * 0.28;
    const crack = (Math.random() * 2 - 1) * 0.45 * crackEnv;
    const body = Math.sin(2 * Math.PI * 180 * t) * 0.12 * Math.exp(-t * 10);
    samples[i] = (boom + body) * boomEnv + crack;
  }
  return samples;
}

mkdirSync(soundsDir, { recursive: true });
const clickWav = join(soundsDir, "click.wav");
const bangWav = join(soundsDir, "bang.wav");
writeWav(clickWav, clickSamples());
writeWav(bangWav, bangSamples());

function convertToMp3(wavPath, mp3Path) {
  const result = spawnSync("ffmpeg", ["-y", "-i", wavPath, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3Path], {
    stdio: "ignore",
  });
  return result.status === 0;
}

const clickOk = convertToMp3(clickWav, join(soundsDir, "click.mp3"));
const bangOk = convertToMp3(bangWav, join(soundsDir, "bang.mp3"));

if (!clickOk || !bangOk) {
  console.warn("ffmpeg not available; WAV files were written as a fallback.");
}
