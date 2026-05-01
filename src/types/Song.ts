export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  src: string;
  artwork?: string | null;

  genre?: string;
  rating?: number;
  listenCount: number;
};
