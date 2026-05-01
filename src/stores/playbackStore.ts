import { create } from "zustand";
import { useLibraryStore } from "@/stores/libraryStore";

type PlaybackState = {
  queue: any[];
  currentIndex: number;
  currentTrack: any | null;

  isPlaying: boolean;
  currentTime: number;
  duration: number;

  shuffle: boolean;
  repeat: boolean;

  audio: HTMLAudioElement | null;
  volume: number;

  setQueueAndPlay: (songs: any[], index: number) => void;
  playTrackAtIndex: (index: number) => void;

  togglePlay: () => void;
  next: () => void;
  prev: () => void;

  setTime: (time: number) => void;

  toggleShuffle: () => void;
  toggleRepeat: () => void;

  setVolume: (v: number) => void;
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  currentTrack: null,

  isPlaying: false,
  currentTime: 0,
  duration: 0,

  shuffle: false,
  repeat: false,

  audio: null,
  volume: 0.7,

  // -----------------------------
  // LOAD + PLAY (FIXED)
  // -----------------------------
  setQueueAndPlay: (songs, index) => {
    const { shuffle } = get();

    let queue = [...songs];
    let newIndex = index;

    if (shuffle) {
      const current = queue[index];
      queue.splice(index, 1);

      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }

      queue.unshift(current);
      newIndex = 0;
    }

    set({ queue });
    get().playTrackAtIndex(newIndex);
  },

  playTrackAtIndex: (index) => {
    const { queue, audio, volume } = get();

    if (!queue[index]) return;

    if (audio) audio.pause();

    const track = queue[index];
    const newAudio = new Audio(track.src);

    newAudio.volume = volume;

    useLibraryStore.getState().incrementListenCount(track.id);

    newAudio.play();

    newAudio.ontimeupdate = () => {
      set({
        currentTime: newAudio.currentTime,
        duration: newAudio.duration || 0,
      });
    };

    newAudio.onended = () => {
      const { repeat, next } = get();

      if (repeat) {
        newAudio.currentTime = 0;
        newAudio.play();
      } else {
        next();
      }
    };

    set({
      currentIndex: index,
      currentTrack: track,
      isPlaying: true,
      audio: newAudio,
    });
  },

  // -----------------------------
  togglePlay: () => {
    const { audio, isPlaying } = get();
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      audio.play();
      set({ isPlaying: true });
    }
  },

  // -----------------------------
  // NEXT / PREV
  // -----------------------------
  next: () => {
    const { queue, currentIndex, repeat } = get();

    if (!queue.length) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeat) nextIndex = 0;
      else return;
    }

    get().playTrackAtIndex(nextIndex);
  },

  prev: () => {
    const { currentIndex } = get();

    const prevIndex = Math.max(0, currentIndex - 1);
    get().playTrackAtIndex(prevIndex);
  },

  setTime: (time) => {
    const { audio } = get();
    if (!audio) return;

    audio.currentTime = time;
    set({ currentTime: time });
  },

  toggleShuffle: () => {
    const { shuffle, queue, currentTrack } = get();

    const nextShuffle = !shuffle;

    if (!queue.length || !currentTrack) {
      set({ shuffle: nextShuffle });
      return;
    }

    if (!nextShuffle) {
      set({ shuffle: false });
      return;
    }

    const remaining = queue.filter((t) => t.id !== currentTrack.id);

    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const newQueue = [currentTrack, ...remaining];

    set({
      queue: newQueue,
      currentIndex: 0,
      shuffle: true,
    });
  },

  toggleRepeat: () =>
    set((s) => ({
      repeat: !s.repeat,
    })),

  setVolume: (v) => {
    const { audio } = get();

    if (audio) audio.volume = v;

    set({ volume: v });
  },
}));
