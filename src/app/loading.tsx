export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Paper texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="flex flex-col items-center gap-6">
        {/* Pulsing logo text */}
        <h1 
          className="font-serif text-2xl text-foreground animate-pulse"
          style={{ animationDuration: "2s" }}
        >
          The Finite Life
        </h1>
        
        {/* Minimal spinner - three dots */}
        <div className="flex gap-1.5">
          <span 
            className="w-2 h-2 rounded-full bg-foreground animate-pulse"
            style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-foreground animate-pulse"
            style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
          />
          <span 
            className="w-2 h-2 rounded-full bg-foreground animate-pulse"
            style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
          />
        </div>
      </div>
    </div>
  );
}
