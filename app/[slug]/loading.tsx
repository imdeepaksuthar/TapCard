import React from 'react';

export default function LoadingCard() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] sm:p-4 md:p-6 lg:p-8 flex justify-center selection:bg-blue-500/30 font-sans">
      <div className="w-full max-w-[480px] bg-white sm:rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden relative border border-zinc-100 flex flex-col min-h-[100dvh] sm:min-h-0">
        
        {/* Top Gradient Skeleton */}
        <div className="h-48 w-full bg-zinc-200 animate-pulse relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="relative px-6 pb-12 -mt-16 flex-grow flex flex-col items-center">
          {/* Avatar Skeleton */}
          <div className="w-32 h-32 rounded-full border-4 border-white bg-zinc-200 animate-pulse shadow-lg mb-6 relative z-10" />

          {/* Name & Designation Skeleton */}
          <div className="w-48 h-8 bg-zinc-200 rounded-lg animate-pulse mb-3" />
          <div className="w-32 h-4 bg-zinc-100 rounded-md animate-pulse mb-6" />
          
          {/* Badge Skeleton */}
          <div className="w-64 h-8 bg-zinc-100 rounded-full animate-pulse mb-8 border border-zinc-200/60" />

          {/* Action Buttons Skeleton (Grid of 4) */}
          <div className="grid grid-cols-4 gap-3 w-full mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square bg-zinc-100 rounded-2xl animate-pulse border border-zinc-100" />
                <div className="w-10 h-2 bg-zinc-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Primary CTA Skeleton */}
          <div className="w-full h-14 bg-zinc-200 rounded-2xl animate-pulse mb-8" />

          {/* Secondary Bento Boxes Skeleton */}
          <div className="w-full bg-zinc-50 rounded-3xl p-5 mb-8 border border-zinc-100 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-200" />
              <div className="space-y-2 flex-1">
                <div className="w-24 h-3 bg-zinc-200 rounded" />
                <div className="w-32 h-4 bg-zinc-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-200" />
              <div className="space-y-2 flex-1">
                <div className="w-24 h-3 bg-zinc-200 rounded" />
                <div className="w-32 h-4 bg-zinc-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Bottom Action Bar Skeleton */}
        <div className="sticky bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 flex gap-3 z-50">
          <div className="flex-1 h-14 bg-zinc-200 rounded-full animate-pulse" />
          <div className="flex-1 h-14 bg-zinc-200 rounded-full animate-pulse" />
        </div>
        
      </div>
    </div>
  );
}
