import React from 'react';
import { Play } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  onClick,
  size = 'md',
}) => {
  const isLarge = size === 'lg';

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 cursor-pointer select-none transition-transform active:scale-95 ${className}`}
      role="button"
      aria-label="Minimo Series Ana Sayfa"
    >
      {/* Creative Typography for Minimo Series with Playful :D touch */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <div className="flex items-baseline">
            <span
              className={`font-display font-black tracking-tighter bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 dark:from-sky-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent group-hover:opacity-95 transition-all ${
                isLarge ? 'text-2xl sm:text-3xl' : 'text-xl'
              }`}
            >
              Minimo
            </span>

            {/* Creative Smiley :D Accent integrated in typography */}
            <span
              className="ml-0.5 text-xs font-black text-cyan-500 dark:text-cyan-400 tracking-tight font-mono -rotate-6 inline-block group-hover:rotate-0 transition-transform"
              title="Minimo :D"
            >
              :D
            </span>
          </div>

          {/* Electric Series Neon Tag */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/10 dark:bg-cyan-500/15 border border-blue-500/30 dark:border-cyan-400/30">
            <Play className="w-2 h-2 fill-cyan-500 text-cyan-500 dark:fill-cyan-400 dark:text-cyan-400" />
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-300">
              SERIES
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
