export default function BorderMotif({ 
  className = "",
  variant = "strip"
}: { 
  className?: string;
  variant?: "strip" | "corner";
}) {
  if (variant === "corner") {
    return (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
        className={`opacity-20 text-brand-mauve ${className}`}
        aria-hidden="true"
      >
        <path d="M30,10 L40,0 L50,10 L40,20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="40" cy="10" r="1.5" fill="currentColor" />
        
        <path d="M40,20 L50,10 L60,20 L50,30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="20" r="1.5" fill="currentColor" />

        <path d="M20,20 L30,10 L40,20 L30,30 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="30" cy="20" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <div className={`w-full overflow-hidden ${className}`} aria-hidden="true" style={{ lineHeight: 0 }}>
      <svg
        width="100%"
        height="12"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-30 text-brand-mauve"
      >
        <defs>
          <pattern
            id="zari-pattern"
            x="0"
            y="0"
            width="40"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,6 L10,2 L20,6 L10,10 Z M20,6 L30,2 L40,6 L30,10 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <circle cx="10" cy="6" r="1" fill="currentColor" />
            <circle cx="30" cy="6" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="12" fill="url(#zari-pattern)" />
      </svg>
    </div>
  );
}
