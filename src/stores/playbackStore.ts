import { create } from "zustand";

export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
};

type PlaybackState = {
  queue: Song[];
  currentIndex: number;

  currentTrack: Song | null;
  isPlaying: boolean;

  duration: number;
  currentTime: number;

  audio: HTMLAudioElement | null;

  setQueueAndPlay: (songs: Song[], index: number) => void;
  playTrackAtIndex: (index: number) => void;

  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  setTime: (time: number) => void;
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  queue: [],
  currentIndex: -1,

  currentTrack: null,
  isPlaying: false,

  duration: 0,
  currentTime: 0,

  audio: null,

  setQueueAndPlay: (songs, index) => {
    set({
      queue: songs,
      currentIndex: index,
    });

    get().playTrackAtIndex(index);
  },

  playTrackAtIndex: (index) => {
    const { queue, audio: prevAudio } = get();
    const song = queue[index];
    if (!song) return;

    if (prevAudio) {
      prevAudio.pause();
      prevAudio.src = "";
    }

    const audio = new Audio(song.src);

    audio.onloadedmetadata = () => {
      set({ duration: audio.duration });
    };

    audio.ontimeupdate = () => {
      set({ currentTime: audio.currentTime });
    };

    audio.onended = () => {
      get().next();
    };

    audio.onerror = (e) => {
      console.error("AUDIO ERROR:", e, song.src);
    };

    // 🔥 prevent AbortError race
    set({
      currentTrack: song,
      currentIndex: index,
      audio,
      isPlaying: true,
      currentTime: 0,
    });

    audio.play().catch((err) => {
      console.error("PLAY FAILED:", err);
    });
  },

  togglePlay: () => {
    const { audio, isPlaying } = get();
    if (!audio) return;

    if (isPlaying) audio.pause();
    else audio.play();

    set({ isPlaying: !isPlaying });
  },

  next: () => {
    const { queue, currentIndex } = get();
    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      get().playTrackAtIndex(nextIndex);
    }
  },

  prev: () => {
    const { currentIndex } = get();
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      get().playTrackAtIndex(prevIndex);
    }
  },

  setTime: (time) => {
    const { audio } = get();
    if (!audio) return;

    audio.currentTime = time;
    set({ currentTime: time });
  },
}));
