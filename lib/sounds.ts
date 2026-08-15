const SOUND_URLS = {
  click: "/sounds/click.mp3",
  bang: "/sounds/bang.mp3",
  spin: "/sounds/spin.mp3",
} as const;

const SOUND_DURATION: Record<keyof typeof SOUND_URLS, number> = {
  click: 2.3,
  bang: 0.86,
  spin: 1.93,
};

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

interface AudioSessionLike {
  type: string;
}

interface NavigatorWithAudioSession extends Navigator {
  audioSession?: AudioSessionLike;
}

let keepAlive: HTMLAudioElement | null = null;
let watching = false;
const templates: Partial<Record<keyof typeof SOUND_URLS, HTMLAudioElement>> = {};

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

function createAudio(url: string, loop = false): HTMLAudioElement {
  const audio = new Audio(url);
  audio.preload = "auto";
  audio.playsInline = true;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.loop = loop;
  return audio;
}

function ensureKeepAlive(): HTMLAudioElement {
  if (!keepAlive) {
    keepAlive = createAudio(SILENT_WAV, true);
    keepAlive.volume = 0.01;
    keepAlive.addEventListener("pause", () => {
      if (document.visibilityState === "visible") {
        void keepAlive?.play().catch(() => undefined);
      }
    });
  }
  return keepAlive;
}

async function startKeepAlive(): Promise<void> {
  const audio = ensureKeepAlive();
  try {
    await audio.play();
  } catch {
    // First gesture will retry via unlockSounds.
  }
}

function preloadTemplates(): void {
  (Object.keys(SOUND_URLS) as Array<keyof typeof SOUND_URLS>).forEach((key) => {
    if (!templates[key]) {
      const audio = createAudio(SOUND_URLS[key]);
      audio.load();
      templates[key] = audio;
    }
  });
}

export async function unlockSounds(): Promise<void> {
  setPlaybackSession();
  preloadTemplates();
  await startKeepAlive();
}

export function watchSoundSession(): void {
  if (watching || typeof window === "undefined") {
    return;
  }

  watching = true;

  const resume = () => {
    if (document.visibilityState === "hidden") {
      return;
    }
    void unlockSounds();
  };

  document.addEventListener("visibilitychange", resume);
  window.addEventListener("pageshow", resume);
  window.addEventListener("focus", resume);
  window.addEventListener("orientationchange", resume);
}

function playFile(key: keyof typeof SOUND_URLS): number {
  setPlaybackSession();
  void startKeepAlive();

  const audio = createAudio(SOUND_URLS[key]);
  audio.currentTime = 0;
  void audio.play().catch(() => {
    const fallback = templates[key];
    if (fallback) {
      fallback.currentTime = 0;
      void fallback.play().catch(() => undefined);
    }
  });

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
