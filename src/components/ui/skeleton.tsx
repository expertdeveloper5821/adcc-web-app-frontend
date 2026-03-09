import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-200 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/** Skeleton for a stat card (used in list page headers) */
function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/** Skeleton for a community/event/track card in the grid */
function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white">
      <Skeleton className="w-14 h-14 rounded-full mb-4" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="flex gap-4 pt-3 border-t border-gray-100">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

/** Full page skeleton for list pages (4 stat cards + 6 card grid) */
function ListPageSkeleton({ cardCount = 6, statCount = 4 }: { cardCount?: number; statCount?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-12 w-44 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Search/Filter bar */}
      <div className="p-4 rounded-2xl shadow-sm bg-white">
        <Skeleton className="h-10 w-full rounded-lg mb-3" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cardCount }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for detail pages */
function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl shadow-sm bg-white space-y-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Skeleton, StatCardSkeleton, CardSkeleton, ListPageSkeleton, DetailPageSkeleton };
