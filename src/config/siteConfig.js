export const CONFIG = {
  websiteName: "warayFlix",
  logoText: "w-flix",
  primaryColor: "bg-[#8B1E2D] hover:bg-[#a52335] text-white font-bold shadow-[0_0_20px_rgba(139,30,45,0.4)]",
  accentColor: "text-[#8B1E2D]",
  secondaryBg: "bg-[#1D2128]",
  tmdbApiKey: "40825dff55157fff1c3d07ca8c5daf34",


  players: [
    {
      id: 'zoryva',
      name: 'Zoryva',
      getMovieUrl: (id, start) => `https://zoryva.me/embedded/movie/${id}${start ? `?startAt=${start}` : ''}`,
      getTvUrl: (id, s, e, start) => `https://zoryva.me/embedded/tv/${id}/${s}/${e}${start ? `?startAt=${start}` : ''}`
    },
    {
      id: 'vidcore',
      name: 'VidCore',
      getMovieUrl: (id, start) => `https://www.vidcore.org/embed/movie/${id}${start ? `?startAt=${start}` : ''}`,
      getTvUrl: (id, s, e, start) => `https://www.vidcore.org/embed/tv/${id}/${s}/${e}${start ? `?startAt=${start}` : ''}`
    },
    {
      id: 'cinesrc',
      name: 'CineSrc',
      getMovieUrl: (id, start) => `https://cinesrc.st/embed/movie?tmdb=${id}${start ? `&startAt=${start}` : ''}`,
      getTvUrl: (id, s, e, start) => `https://cinesrc.st/embed/tv?tmdb=${id}&season=${s}&episode=${e}${start ? `&startAt=${start}` : ''}`
    },
    {
      id: 'videasy',
      name: 'Videasy',
      getMovieUrl: (id, start) => `https://player.videasy.to/movie/${id}${start ? `?t=${start}s` : ''}`,
      getTvUrl: (id, s, e, start) => `https://player.videasy.to/tv/${id}/${s}/${e}${start ? `?t=${start}s` : ''}`
    }
  ]
};