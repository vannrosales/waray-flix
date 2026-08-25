const makeTimeQuery = (start) => {
  if (!start || start <= 0) return '';
  const s = Math.floor(start);
  return `?t=${s}&startAt=${s}&time=${s}&start=${s}`;
};

export const CONFIG = {
  websiteName: "WarayFlix",
  logoText: "waray-flix",
  tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY || "40825dff55157fff1c3d07ca8c5daf34",

  players: [
    {
      id: 'cinesrc',
      name: 'CineSrc',
      getMovieUrl: (id, start) => `https://cinesrc.st/embed/movie/${id}${makeTimeQuery(start)}`,
      getTvUrl: (id, s, e, start) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}${makeTimeQuery(start)}`
    },
    {
      id: 'vidsrc',
      name: 'VidSrc',
      getMovieUrl: (id, start) => `https://vidsrc.to/embed/movie/${id}${makeTimeQuery(start)}`,
      getTvUrl: (id, s, e, start) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}${makeTimeQuery(start)}`
    },
    {
      id: 'zoryva',
      name: 'Zoryva',
      getMovieUrl: (id, start) => `https://zoryva.me/embedded/movie/${id}${makeTimeQuery(start)}`,
      getTvUrl: (id, s, e, start) => `https://zoryva.me/embedded/tv/${id}/${s}/${e}${makeTimeQuery(start)}`
    },
    {
      id: 'vidcore',
      name: 'VidCore',
      getMovieUrl: (id, start) => `https://www.vidcore.org/embed/movie/${id}${makeTimeQuery(start)}`,
      getTvUrl: (id, s, e, start) => `https://www.vidcore.org/embed/tv/${id}/${s}/${e}${makeTimeQuery(start)}`
    },
    {
      id: 'videasy',
      name: 'Videasy',
      getMovieUrl: (id, start) => `https://player.videasy.to/movie/${id}${makeTimeQuery(start)}`,
      getTvUrl: (id, s, e, start) => `https://player.videasy.to/tv/${id}/${s}/${e}${makeTimeQuery(start)}`
    }
  ]
};
