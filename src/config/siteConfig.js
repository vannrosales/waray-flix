import { subtitleService } from '../services/subtitleService';

const makeTimeAndSubtitleQuery = (start, subLang) => {
  const effectiveSub = subLang !== undefined ? subLang : subtitleService.getPreferredLanguage();
  return subtitleService.buildPlayerQueryParams(start, effectiveSub);
};

export const CONFIG = {
  websiteName: "WarayFlix",
  logoText: "waray-flix",
  desktopAppUrl: "https://www.mediafire.com/file/p7razjd5dvs2jlx/WarayFlix_1.0.0_x64-setup.exe/file",
  tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY || "40825dff55157fff1c3d07ca8c5daf34",

  players: [
    {
      id: 'videasy',
      name: 'Videasy (Subtitles)',
      getMovieUrl: (id, start, sub) => `https://player.videasy.to/movie/${id}${makeTimeAndSubtitleQuery(start, sub)}`,
      getTvUrl: (id, s, e, start, sub) => `https://player.videasy.to/tv/${id}/${s}/${e}${makeTimeAndSubtitleQuery(start, sub)}`
    },
    {
      id: 'vidcore',
      name: 'VidCore (Multi-Sub)',
      getMovieUrl: (id, start, sub) => `https://www.vidcore.org/embed/movie/${id}${makeTimeAndSubtitleQuery(start, sub)}`,
      getTvUrl: (id, s, e, start, sub) => `https://www.vidcore.org/embed/tv/${id}/${s}/${e}${makeTimeAndSubtitleQuery(start, sub)}`
    },
    {
      id: 'zoryva',
      name: 'Zoryva X',
      getMovieUrl: (id, start, sub) => `https://zoryva.me/embed/movie/${id}${makeTimeAndSubtitleQuery(start, sub)}`,
      getTvUrl: (id, s, e, start, sub) => `https://zoryva.me/embed/tv/${id}/${s}/${e}${makeTimeAndSubtitleQuery(start, sub)}`
    },
    {
      id: 'vidsrc',
      name: 'VidSrc',
      getMovieUrl: (id, start, sub) => `https://vidsrc.to/embed/movie/${id}${makeTimeAndSubtitleQuery(start, sub)}`,
      getTvUrl: (id, s, e, start, sub) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}${makeTimeAndSubtitleQuery(start, sub)}`
    },
    {
      id: 'cinesrc',
      name: 'CineSrc',
      getMovieUrl: (id, start, sub) => `https://cinesrc.st/embed/movie/${id}${makeTimeAndSubtitleQuery(start, sub)}`,
      getTvUrl: (id, s, e, start, sub) => `https://cinesrc.st/embed/tv/${id}/${s}/${e}${makeTimeAndSubtitleQuery(start, sub)}`
    }
  ]
};
