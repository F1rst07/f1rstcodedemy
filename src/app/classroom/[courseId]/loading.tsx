
export default function Loading() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col max-h-screen overflow-y-auto w-full md:w-[70%] lg:w-[75%] p-4 sm:p-6 lg:p-8 space-y-6">

                {/* Header Skeleton */}
                <div className="flex items-center justify-between animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-1/3"></div>
                    <div className="h-8 bg-white/10 rounded w-24"></div>
                </div>

                {/* Video Player Skeleton */}
                <div className="aspect-video bg-white/5 rounded-xl border border-white/10 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-loading"></div>
                </div>

                {/* Info Skeleton */}
                <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-1/2"></div>
                    <div className="h-4 bg-white/5 rounded w-full"></div>
                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="w-full md:w-[30%] lg:w-[25%] bg-[#111] border-l border-white/10 p-4 hidden md:block animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-white/5 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
