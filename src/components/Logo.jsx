export default function Logo({ className = "w-8 h-8", variant = "full" }) {
  if (variant === "icon") {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Serene tree with roots */}
        <defs>
          <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        {/* Roots */}
        <path d="M50 65 C45 70, 35 75, 25 80 M50 65 C55 70, 65 75, 75 80 M50 65 C48 72, 42 78, 35 82 M50 65 C52 72, 58 78, 65 82" 
          stroke="url(#treeGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        
        {/* Trunk */}
        <rect x="46" y="40" width="8" height="25" rx="1" fill="url(#treeGradient)"/>
        
        {/* Canopy - organic flowing shapes */}
        <circle cx="50" cy="30" r="12" fill="url(#treeGradient)" opacity="0.9"/>
        <circle cx="40" cy="35" r="10" fill="url(#treeGradient)" opacity="0.85"/>
        <circle cx="60" cy="35" r="10" fill="url(#treeGradient)" opacity="0.85"/>
        <circle cx="45" cy="25" r="8" fill="url(#treeGradient)" opacity="0.8"/>
        <circle cx="55" cy="25" r="8" fill="url(#treeGradient)" opacity="0.8"/>
        <circle cx="50" cy="20" r="7" fill="url(#treeGradient)" opacity="0.75"/>
        
        {/* Subtle leaf details */}
        <path d="M38 32 Q35 28, 38 26" stroke="#ECFDF5" strokeWidth="1" opacity="0.4" fill="none"/>
        <path d="M62 32 Q65 28, 62 26" stroke="#ECFDF5" strokeWidth="1" opacity="0.4" fill="none"/>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo variant="icon" className="w-8 h-8" />
      <span className="font-bold text-slate-900 dark:text-white tracking-tight">
        IboAftercare Coach
      </span>
    </div>
  );
}