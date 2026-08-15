const SOUND_URLS = {
  click: "/sounds/click.mp3",
  bang: "/sounds/bang.mp3",
  spin: "/sounds/spin.mp3",
} as const;

type SoundName = keyof typeof SOUND_URLS;

const SOUND_DURATION: Record<SoundName, number> = {
  click: 2.3,
  bang: 0.86,
  spin: 1.93,
};

interface AudioSessionLike {
  type: string;
}

interface NavigatorWithAudioSession extends Navigator {
  audioSession?: AudioSessionLike;
}

type WebkitAudioContext = typeof AudioContext;

let audioContext: AudioContext | null = null;
let keepAliveSource: AudioBufferSourceNode | null = null;
let watching = false;
let htmlUnlocked = false;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};
const htmlPlayers: Partial<Record<SoundName, HTMLAudioElement>> = {};
let loadingBuffers: Promise<void> | null = null;

function setPlaybackSession(): void {
  const session = (navigator as NavigatorWithAudioSession).audioSession;
  if (session) {
    session.type = "playback";
  }

  if (navigator.mediaSession) {
    navigator.mediaSession.playbackState = "playing";
    if (!navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "Револьвер",
        artist: "Liars Bar",
      });
    }
  }
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const Context =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: WebkitAudioContext }).webkitAudioContext;
    audioContext = new Context();
    audioContext.onstatechange = () => {
      if (audioContext?.state === "running") {
        return;
      }
      if (document.visibilityState === "visible") {
        setPlaybackSession();
        void audioContext?.resume();
      }
    };
  }
  return audioContext;
}

function createHtmlAudio(url: string): HTMLAudioElement {
  const audio = new Audio(url);
  audio.preload = "auto";
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.muted = false;
  return audio;
}

function ensureHtmlPlayer(key: SoundName): HTMLAudioElement {
  if (!htmlPlayers[key]) {
    const audio = createHtmlAudio(SOUND_URLS[key]);
    audio.load();
    htmlPlayers[key] = audio;
  }
  return htmlPlayers[key];
}

function startKeepAlive(context: AudioContext): void {
  if (keepAliveSource) {
    return;
  }

  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * 0.00005;
  }

  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.loop = true;
  gain.gain.value = 1;
  source.connect(gain);
  gain.connect(context.destination);
  source.onended = () => {
    keepAliveSource = null;
  };
  source.start();
  keepAliveSource = source;
}

async function loadBuffers(context: AudioContext): Promise<void> {
  if (loadingBuffers) {
    await loadingBuffers;
    return;
  }

  loadingBuffers = Promise.all(
    (Object.keys(SOUND_URLS) as SoundName[]).map(async (key) => {
      if (buffers[key]) {
        return;
      }
      ensureHtmlPlayer(key);
      const response = await fetch(SOUND_URLS[key]);
      const bytes = await response.arrayBuffer();
      buffers[key] = await context.decodeAudioData(bytes.slice(0));
    }),
  )
    .then(() => undefined)
    .catch(() => {
      loadingBuffers = null;
    });

  await loadingBuffers;
}

async function warmHtmlPlayers(): Promise<void> {
  if (htmlUnlocked) {
    return;
  }

  const results = await Promise.all(
    (Object.keys(SOUND_URLS) as SoundName[]).map(async (key) => {
      const audio = ensureHtmlPlayer(key);
      audio.volume = 0;
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
        return true;
      } catch {
        audio.volume = 1;
        return false;
      }
    }),
  );

  htmlUnlocked = results.some(Boolean);
}

export async function unlockSounds(): Promise<void> {
  setPlaybackSession();
  const context = getAudioContext();
  if (context.state !== "running") {
    await context.resume();
  }
  startKeepAlive(context);
  await warmHtmlPlayers();
  await loadBuffers(context);
}

export function watchSoundSession(): void {
  if (watching || typeof window === "undefined") {
    return;
  }

  watching = true;

  const resume = () => {
    setPlaybackSession();
    if (document.visibilityState === "hidden") {
      return;
    }
    void unlockSounds();
  };

  document.addEventListener("pointerdown", resume, { capture: true, passive: true });
  document.addEventListener("touchstart", resume, { capture: true, passive: true });
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("pageshow", resume);
  window.addEventListener("focus", resume);
  window.addEventListener("orientationchange", resume);
}

function playHtml(key: SoundName): void {
  const audio = ensureHtmlPlayer(key);
  audio.muted = false;
  audio.volume = 1;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

function playFile(key: SoundName): number {
  setPlaybackSession();
  const context = getAudioContext();
  void context.resume();
  startKeepAlive(context);

  const buffer = buffers[key];
  if (buffer && context.state === "running") {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  } else {
    playHtml(key);
  }

  return SOUND_DURATION[key];
}

export async function playClick(): Promise<number> {
  await unlockSounds();
  return playFile("click");
}

export async function playBang(): Promise<number> {
  await unlockSounds();
  return playFile("bang");
}

export async function playSpin(): Promise<number> {
  await unlockSounds();
  return playFile("spin");
}

function playDiceClack(context: AudioContext, time: number, volume: number): void {
  const length = Math.floor(context.sampleRate * 0.028);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2.4);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 900 + Math.random() * 1400;
  filter.Q.value = 1.8;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.03), time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(time);
}

export async function playDice(): Promise<number> {
  await unlockSounds();
  setPlaybackSession();
  const context = getAudioContext();
  if (context.state !== "running") {
    await context.resume();
  }

  const start = context.currentTime + 0.02;
  const hits = 11;
  for (let index = 0; index < hits; index += 1) {
    const time = start + index * (0.055 + index * 0.01);
    playDiceClack(context, time, 0.62 - index * 0.04);
  }

  return 0.95;
}
