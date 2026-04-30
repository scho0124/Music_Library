import { create } from "zustand";

export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  src: string;
};

type PlaybackState = {
  currentTrack: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;

  audio: HTMLAudioElement | null;

  setTrack: (song: Song) => void;
  togglePlay: () => void;
  setTime: (time: number) => void;
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  duration: 0,
  currentTime: 0,

  audio: null,

  setTrack: (song) => {
    const prevAudio = get().audio;

    // stop previous audio
    if (prevAudio) {
      prevAudio.pause();
    }

    const audio = new Audio(song.src);

    audio.play();

    audio.onloadedmetadata = () => {
      set({ duration: audio.duration });
    };

    audio.ontimeupdate = () => {
      set({ currentTime: audio.currentTime });
    };

    audio.onended = () => {
      set({ isPlaying: false });
    };

    set({
      currentTrack: song,
      audio,
      isPlaying: true,
    });
  },

  togglePlay: () => {
    const { audio, isPlaying } = get();

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    set({ isPlaying: !isPlaying });
  },

  setTime: (time) => {
    const { audio } = get();
    if (!audio) return;

    audio.currentTime = time;
    set({ currentTime: time });
  },
}));
