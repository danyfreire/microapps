import type { DailyTotals } from "@/domain/nutrition";
import { formatKcal } from "@/lib/format";

interface DailyProgressProps {
  totals: DailyTotals;
  goal?: number;
}

export function DailyProgress({ totals, goal }: DailyProgressProps) {
  const pct =
    goal && goal > 0 ? Math.min(100, Math.round((totals.calories / goal) * 100)) : null;
  const remaining = goal != null ? goal - totals.calories : null;

  return (
    <section aria-label="Progreso diario" className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-neutral-500">Total de hoy</h2>
        {goal != null && (
          <span className="text-xs text-neutral-400">Objetivo {formatKcal(goal)}</span>
        )}
      </div>

      <p className="mt-1 text-4xl font-bold tracking-tight text-neutral-900">
        {formatKcal(totals.calories)}
        {goal != null && (
          <span className="ml-2 text-lg font-medium text-neutral-400">/ {formatKcal(goal)}</span>
        )}
      </p>

      {pct != null && (
        <div
          className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-100"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso hacia el objetivo"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {remaining != null && (
        <p className="mt-2 text-sm text-neutral-500">
          {remaining >= 0
            ? `${formatKcal(remaining)} restantes`
            : `${formatKcal(Math.abs(remaining))} sobre el objetivo`}
        </p>
      )}

      {totals.mealCount === 0 && (
        <p className="mt-2 text-sm text-neutral-400">Aún no registras comidas hoy.</p>
      )}
    </section>
  );
}
