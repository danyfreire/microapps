import type { Meal } from "@/domain/schemas";
import { confidenceLabel, formatGrams, formatKcal } from "@/lib/format";
import { EditIcon, TrashIcon } from "./icons";

interface MealListProps {
  meals: Meal[];
  onEdit: (meal: Meal) => void;
  onDelete: (id: string) => void;
}

export function MealList({ meals, onEdit, onDelete }: MealListProps) {
  if (meals.length === 0) return null;

  return (
    <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
      {meals.map((meal) => (
        <li key={meal.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-neutral-900">{meal.label}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              P {formatGrams(meal.proteinGrams)} · C {formatGrams(meal.carbsGrams)} · G{" "}
              {formatGrams(meal.fatGrams)}
              {meal.confidence ? ` · confianza ${confidenceLabel(meal.confidence)}` : ""}
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
            {formatKcal(meal.calories)}
          </span>
          <button
            type="button"
            onClick={() => onEdit(meal)}
            aria-label={`Editar ${meal.label}`}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <EditIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(meal.id)}
            aria-label={`Eliminar ${meal.label}`}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
