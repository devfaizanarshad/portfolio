import { stats } from "@/lib/content";

export function ProofStats() {
  return (
    <section aria-label="Results at a glance" className="relative z-10 border-y border-bone/10 bg-ink-900">
      <ol
        data-reveal-stagger
        className="mx-auto grid max-w-[1240px] grid-cols-1 divide-y divide-bone/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {stats.map((stat) => {
          const finalValue = `${stat.value.toFixed(stat.decimals)}${stat.suffix}`;
          return (
            <li key={stat.label} className="stat">
              <p className="stat-value" aria-hidden="true">
                <span data-count={stat.value} data-decimals={stat.decimals}>
                  {stat.value.toFixed(stat.decimals)}
                </span>
                <span className="text-signal">{stat.suffix}</span>
              </p>
              <p className="sr-only">{finalValue}</p>
              <p className="mono-label mt-4">{stat.label}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
