import { create } from "zustand";
import { useLibraryStore } from "@/stores/libraryStore";

export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  artwork?: string | null;
};

type PlaybackState = {
  queue: Song[];
  currentIndex: number;

  currentTrack: Song | null;
  isPlaying: boolean;

  duration: number;
  currentTime: number;

  audio: HTMLAudioElement | null;

  shuffle: boolean;
  repeat: boolean;

  setQueueAndPlay: (songs: Song[], index: number) => void;
  playTrackAtIndex: (index: number) => void;

  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  setTime: (time: number) => void;

  toggleShuffle: () => void;
  toggleRepeat: () => void;
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  queue: [],
  currentIndex: -1,

  currentTrack: null,
  isPlaying: false,

  duration: 0,
  currentTime: 0,

  audio: null,

  shuffle: false,
  repeat: false,

  // -----------------------------
  setQueueAndPlay: (songs, index) => {
    set({
      queue: songs,
      currentIndex: index,
    });

    get().playTrackAtIndex(index);
  },

  // -----------------------------
  playTrackAtIndex: (index) => {
    const { queue, audio: prevAudio } = get();
    const song = queue[index];
    if (!song) return;

    useLibraryStore.getState().incrementListenCount(song.id);

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
      const { repeat } = get();

      if (repeat) {
        audio.currentTime = 0;
        audio.play();
        return;
      }

      get().next();
    };

    audio.onerror = (e) => {
      console.error("AUDIO ERROR:", e, song.src);
    };

    set({
      currentTrack: song,
      currentIndex: index,
      audio,
      isPlaying: true,
      currentTime: 0,
    });

    audio.play().catch(console.error);
  },

  // -----------------------------
  togglePlay: () => {
    const { audio, isPlaying } = get();
    if (!audio) return;

    if (isPlaying) audio.pause();
    else audio.play();

    set({ isPlaying: !isPlaying });
  },

  // -----------------------------
  next: () => {
    const { queue, currentIndex, shuffle } = get();

    if (queue.length === 0) return;

    if (shuffle) {
      let nextIndex = currentIndex;

      while (nextIndex === currentIndex && queue.length > 1) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }

      get().playTrackAtIndex(nextIndex);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex < queue.length) {
      get().playTrackAtIndex(nextIndex);
    } else {
      set({ isPlaying: false });
    }
  },

  // -----------------------------
  prev: () => {
    const { currentIndex, audio } = get();

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      get().playTrackAtIndex(currentIndex - 1);
    }
  },

  // -----------------------------
  setTime: (time) => {
    const { audio } = get();
    if (!audio) return;

    audio.currentTime = time;
    set({ currentTime: time });
  },

  // -----------------------------
  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  toggleRepeat: () => {
    set((state) => ({ repeat: !state.repeat }));
  },
}));
