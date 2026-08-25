import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

export default function DetailCastSection({ castList }) {
  const navigate = useNavigate();
  if (!castList || castList.length === 0) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-white/[0.08]">
      <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-wider font-semibold">
        <Users className="w-3.5 h-3.5 stroke-[1.5] text-white" />
        <span>Cast & Crew</span>
      </div>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
        {castList.map((actor) => {
          const profileImg = getImageUrl(actor.profile_path, 'thumbnail');
          return (
            <div 
              key={actor.id} 
              onClick={() => navigate(`/person/${actor.id}`)}
              className="w-20 sm:w-24 flex-shrink-0 space-y-1.5 text-center group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-white/40 transition shadow-sm relative flex items-center justify-center">
                {profileImg ? (
                  <img 
                    src={profileImg} 
                    alt={actor.name} 
                    loading="lazy"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[9px]">
                    CAST
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-white group-hover:text-zinc-300 truncate transition-colors">
                  {actor.name}
                </h4>
                <p className="text-[9px] text-zinc-400 truncate">
                  {actor.character}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
