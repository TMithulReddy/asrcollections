export default function PatternBackground({ 
  className = "",
  opacityClass = "opacity-[0.04]"
}: { 
  className?: string;
  opacityClass?: string;
}) {
  return (
    <div 
      className={`absolute inset-0 z-0 pointer-events-none text-brand-mauve ${opacityClass} ${className}`} 
      aria-hidden="true"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="zari-bg-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Main Diamond */}
            <path
              d="M30,10 L45,25 L30,40 L15,25 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            {/* Center dot */}
            <circle cx="30" cy="25" r="1.5" fill="currentColor" />
            
            {/* Corner fragments */}
            <path
              d="M0,25 L5,30 L0,35 Z M60,25 L55,30 L60,35 Z M25,0 L30,5 L35,0 Z M25,60 L30,55 L35,60 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            
            {/* Intersecting dots */}
            <circle cx="0" cy="0" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#zari-bg-pattern)" />
      </svg>
    </div>
  );
}
