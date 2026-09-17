const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-200 dark:bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
