"use client";

import { useEffect, useState } from "react";
import { DailyProgress } from "@/components/DailyProgress";
import { EstimatePanel, type EditableDraft } from "@/components/EstimatePanel";
import { MealComposer } from "@/components/MealComposer";
import { MealList } from "@/components/MealList";
import { mealToEstimate, newId } from "@/domain/meal";
import { localDayKey, sumMeals } from "@/domain/nutrition";
import type { Meal, NutritionEstimate } from "@/domain/schemas";
import { ApiError, estimateText } from "@/lib/api";
import { track } from "@/lib/analytics";
import { deleteMeal, getMeals, getSettings, putMeal } from "@/lib/storage";

interface DraftState {
  estimate: NutritionEstimate;
  mockBadge: boolean;
  editingId: string | null;
}

export default function HomePage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goal, setGoal] = useState<number | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const day = localDayKey();

  useEffect(() => {
    track("app_opened");
    Promise.all([getSettings(), getMeals(day)])
      .then(([settings, meals]) => {
        setGoal(settings.calorieGoal);
        setMeals(meals);
        setLoaded(true);
      })
      .catch(() => {
        setError("No se pudo cargar el diario local.");
        setLoaded(true);
      });
  }, [day]);

  async function handleEstimate(text: string) {
    setError(null);
    setNotice(null);
    setEstimating(true);
    track("estimate_started");
    try {
      const result = await estimateText(text);
      setDraft({
        estimate: result.estimate,
        mockBadge: result.provider === "mock",
        editingId: null,
      });
      track("estimate_succeeded");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo estimar la comida.";
      setError(message);
      track("estimate_failed");
    } finally {
      setEstimating(false);
    }
  }

  async function handleConfirm(editable: EditableDraft) {
    if (!draft) return;

    let meal: Meal;
    if (draft.editingId) {
      const existing = meals.find((m) => m.id === draft.editingId);
      if (!existing) return;
      meal = {
        ...existing,
        label: editable.label,
        calories: editable.calories,
        proteinGrams: editable.proteinGrams,
        carbsGrams: editable.carbsGrams,
        fatGrams: editable.fatGrams,
        components: editable.components,
      };
    } else {
      meal = {
        id: newId(),
        createdAt: new Date().toISOString(),
        label: editable.label,
        calories: editable.calories,
        proteinGrams: editable.proteinGrams,
        carbsGrams: editable.carbsGrams,
        fatGrams: editable.fatGrams,
        source: "text",
        confidence: draft.estimate.confidence,
        assumptions: draft.estimate.assumptions,
        components: editable.components,
      };
    }

    await putMeal(day, meal);
    setMeals((prev) => {
      if (prev.some((m) => m.id === meal.id)) {
        return prev.map((m) => (m.id === meal.id ? meal : m));
      }
      return [...prev, meal];
    });
    track(draft.editingId ? "meal_edited" : "meal_added");
    setDraft(null);
  }

  function handleEdit(meal: Meal) {
    setError(null);
    setNotice(null);
    setDraft({ estimate: mealToEstimate(meal), mockBadge: false, editingId: meal.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    await deleteMeal(day, id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    track("meal_deleted");
  }

  function handlePhoto() {
    setNotice("La estimación por foto estará disponible pronto. Por ahora puedes usar texto.");
    track("photo_selected");
  }

  const totals = sumMeals(meals);

  return (
    <div className="space-y-5 p-4 pb-8">
      <header className="flex items-baseline justify-between pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Calo</h1>
        <span className="text-sm text-neutral-500">Hoy</span>
      </header>

      <DailyProgress totals={totals} goal={goal} />

      <MealComposer estimating={estimating} onEstimate={handleEstimate} onPhoto={handlePhoto} />

      {notice && (
        <p role="status" className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {notice}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {draft && (
        <EstimatePanel
          estimate={draft.estimate}
          mockBadge={draft.mockBadge}
          confirmLabel={draft.editingId ? "Guardar cambios" : "Agregar a mi día"}
          onConfirm={handleConfirm}
          onCancel={() => setDraft(null)}
        />
      )}

      {loaded && meals.length > 0 && (
        <section aria-label="Comidas de hoy">
          <h2 className="mb-2 text-sm font-medium text-neutral-500">Comidas de hoy</h2>
          <MealList meals={meals} onEdit={handleEdit} onDelete={handleDelete} />
        </section>
      )}
    </div>
  );
}
