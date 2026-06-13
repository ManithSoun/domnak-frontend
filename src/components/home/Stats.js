export default function Stats() {
  const stats = [
    { id: 1, value: "15%", label: "Average project cost saved" },
    { id: 2, value: "3 min", label: "Average document generation time" },
  ];

  return (
    <section className="bg-brand-gold text-white border-y border-brand-gold-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/20">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center text-center p-2 first:pb-6 md:first:pb-2 last:pt-6 md:last:pt-2"
            >
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                {stat.value}
              </span>
              <span className="mt-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-white/80">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
