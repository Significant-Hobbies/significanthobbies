export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-stone-200" />
        <div className="h-4 w-96 rounded bg-stone-100" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-stone-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
