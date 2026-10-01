"use client";

import { useState } from "react";
import type { NutritionEstimate } from "@/domain/schemas";
import { confidenceLabel, formatGrams, formatKcal } from "@/lib/format";
import { CheckIcon, EditIcon, PlusIcon, XIcon } from "./icons";

export interface EditableDraft {
  label: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface EstimatePanelProps {
  estimate: NutritionEstimate;
  mockBadge?: boolean;
  confirmLabel?: string;
  onConfirm: (draft: EditableDraft) => void;
  onCancel: () => void;
}

interface FormState {
  label: string;
  calories: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
}

function toForm(estimate: NutritionEstimate): FormState {
  return {
    label: estimate.dish,
    calories: String(estimate.estimatedCalories),
    proteinGrams: String(estimate.proteinGrams),
    carbsGrams: String(estimate.carbsGrams),
    fatGrams: String(estimate.fatGrams),
  };
}

function toNonNeg(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function EstimatePanel({
  estimate,
  mockBadge = false,
  confirmLabel = "Agregar a mi día",
  onConfirm,
  onCancel,
}: EstimatePanelProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => toForm(estimate));

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit() {
    onConfirm({
      label: form.label.trim() || estimate.dish,
      calories: Math.round(toNonNeg(form.calories)),
      proteinGrams: toNonNeg(form.proteinGrams),
      carbsGrams: toNonNeg(form.carbsGrams),
      fatGrams: toNonNeg(form.fatGrams),
    });
  }

  return (
    <section
      aria-label="Estimación"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-neutral-900">
            {editing ? "Editar estimación" : estimate.dish}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600">
              Confianza {confidenceLabel(estimate.confidence)}
            </span>
            {mockBadge && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Estimación de desarrollo (sin IA)
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Descartar"
          className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white hover:text-neutral-700"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="field-label" className="text-xs font-medium text-neutral-600">
              Descripción
            </label>
            <input
              id="field-label"
              type="text"
              value={form.label}
              onChange={(e) => set("label", e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="field-calories"
              label="Calorías (kcal)"
              value={form.calories}
              onChange={(v) => set("calories", v)}
            />
            <NumberField
              id="field-protein"
              label="Proteína (g)"
              value={form.proteinGrams}
              onChange={(v) => set("proteinGrams", v)}
            />
            <NumberField
              id="field-carbs"
              label="Carbohidratos (g)"
              value={form.carbsGrams}
              onChange={(v) => set("carbsGrams", v)}
            />
            <NumberField
              id="field-fat"
              label="Grasa (g)"
              value={form.fatGrams}
              onChange={(v) => set("fatGrams", v)}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
            ≈ {formatKcal(estimate.estimatedCalories)}
          </p>
          {estimate.calorieRange && (
            <p className="mt-1 text-sm text-neutral-500">
              {formatKcal(estimate.calorieRange.min)}–{formatKcal(estimate.calorieRange.max)}{" "}
              estimadas
            </p>
          )}

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Macro label="Proteína" value={formatGrams(estimate.proteinGrams)} />
            <Macro label="Carbohidratos" value={formatGrams(estimate.carbsGrams)} />
            <Macro label="Grasa" value={formatGrams(estimate.fatGrams)} />
          </dl>

          {estimate.assumptions.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-neutral-600">Supuse:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-neutral-600">
                {estimate.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        Esta es una estimación. Puedes corregirla antes de agregarla.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-base font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800"
        >
          {editing ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
          {editing ? "Guardar" : confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          <EditIcon className="h-5 w-5" />
          {editing ? "Ver" : "Editar"}
        </button>
      </div>
    </section>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-2 py-3">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-neutral-600">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}
