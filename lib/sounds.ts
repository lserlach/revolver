interface SoundBuffers {
  click: AudioBuffer;
  bang: AudioBuffer;
  spin: AudioBuffer;
}

let audioContext: AudioContext | null = null;
let buffers: SoundBuffers | null = null;
let loading: Promise<SoundBuffers> | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function silentBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  return ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
}

async function decodeFile(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const bytes = await response.arrayBuffer();
    return await ctx.decodeAudioData(bytes.slice(0));
  } catch {
    return null;
  }
}

async function loadOne(ctx: AudioContext, url: string, fallbackDuration: number): Promise<AudioBuffer> {
  return (await decodeFile(ctx, url)) ?? silentBuffer(ctx, fallbackDuration);
}

async function loadBuffers(): Promise<SoundBuffers> {
  const ctx = getContext();
  const [click, bang, spin] = await Promise.all([
    loadOne(ctx, "/sounds/click.mp3", 0.2),
    loadOne(ctx, "/sounds/bang.mp3", 0.8),
    loadOne(ctx, "/sounds/spin.mp3", 1.9),
  ]);
  return { click, bang, spin };
}

export async function unlockSounds(): Promise<void> {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  if (!loading) {
    loading = loadBuffers().then((loaded) => {
      buffers = loaded;
      return loaded;
    });
  }
  await loading;
}

function playBuffer(buffer: AudioBuffer, gainValue: number): number {
  const ctx = getContext();
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = gainValue;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  return buffer.duration;
}

export async function playClick(): Promise<number> {
  await unlockSounds();
  return playBuffer(buffers?.click ?? silentBuffer(getContext(), 0.2), 1);
}

export async function playBang(): Promise<number> {
  await unlockSounds();
  return playBuffer(buffers?.bang ?? silentBuffer(getContext(), 0.8), 1);
}

export async function playSpin(): Promise<number> {
  await unlockSounds();
  return playBuffer(buffers?.spin ?? silentBuffer(getContext(), 1.9), 1);
}
