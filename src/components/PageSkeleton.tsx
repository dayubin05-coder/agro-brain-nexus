import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="space-y-2.5">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}

export function RouteFallback() {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Carregando…</p>
      </div>
    </div>
  );
}

export default PageSkeleton;
