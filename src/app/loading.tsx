export default function Loading() {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero Skeleton */}
            <div className="relative min-h-svh flex flex-col items-center justify-center px-4 py-20">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black animate-pulse" />

                <div className="relative z-10 text-center space-y-6 w-full max-w-4xl mx-auto">
                    {/* Badge skeleton */}
                    <div className="flex justify-center">
                        <div className="h-8 w-40 bg-white/10 rounded-full animate-pulse" />
                    </div>

                    {/* Title skeleton */}
                    <div className="space-y-4">
                        <div className="h-16 sm:h-24 w-3/4 mx-auto bg-white/10 rounded-lg animate-pulse" />
                        <div className="h-8 sm:h-12 w-1/2 mx-auto bg-white/5 rounded-lg animate-pulse" />
                    </div>

                    {/* Subtitle skeleton */}
                    <div className="h-6 w-2/3 mx-auto bg-white/5 rounded animate-pulse" />

                    {/* Buttons skeleton */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <div className="h-14 w-48 bg-gold-500/20 rounded-full animate-pulse" />
                        <div className="h-14 w-48 bg-white/10 rounded-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
