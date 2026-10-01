"use client";

import { useState } from "react";
import type { NutritionComponent, NutritionEstimate } from "@/domain/schemas";
import {
  calculateComponent,
  calculateComponents,
  formatPortionQuantity,
  getSelectedUnit,
} from "@/domain/portions";
import { confidenceLabel, formatGrams, formatKcal } from "@/lib/format";
import { EditIcon, PlusIcon, XIcon } from "./icons";

export interface EditableDraft {
  label: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  components?: NutritionComponent[];
}

interface EstimatePanelProps {
  estimate: NutritionEstimate;
  mockBadge?: boolean;
  confirmLabel?: string;
  onConfirm: (draft: EditableDraft) => void;
  onCancel: () => void;
}

export function EstimatePanel({
  estimate,
  mockBadge = false,
  confirmLabel = "Agregar a mi día",
  onConfirm,
  onCancel,
}: EstimatePanelProps) {
  const [editing, setEditing] = useState(false);
  const [components, setComponents] = useState<NutritionComponent[]>(
    () => estimate.components?.map((component) => ({ ...component })) ?? [],
  );

  const hasComponents = components.length > 0;
  const totals = hasComponents
    ? calculateComponents(components)
    : {
        calories: estimate.estimatedCalories,
        proteinGrams: estimate.proteinGrams,
        carbsGrams: estimate.carbsGrams,
        fatGrams: estimate.fatGrams,
      };

  function updateComponent(
    index: number,
    patch: Partial<Pick<NutritionComponent, "quantity" | "unitId">>,
  ) {
    setComponents((current) =>
      current.map((component, componentIndex) => {
        if (componentIndex !== index) return component;

        let quantity = patch.quantity ?? component.quantity;
        if (patch.unitId && patch.unitId !== component.unitId && patch.quantity == null) {
          const previous = getSelectedUnit(component);
          const next = component.unitOptions.find((option) => option.id === patch.unitId);
          if (next && previous.caloriesPerUnit > 0 && next.caloriesPerUnit > 0) {
            quantity = (component.quantity * previous.caloriesPerUnit) / next.caloriesPerUnit;
            quantity = patch.unitId === "g"
              ? Math.round(quantity)
              : Math.round(quantity * 100) / 100;
          }
        }

        return { ...component, ...patch, quantity, assumed: false };
      }),
    );
  }

  function submit() {
    onConfirm({
      label: estimate.dish,
      calories: totals.calories,
      proteinGrams: totals.proteinGrams,
      carbsGrams: totals.carbsGrams,
      fatGrams: totals.fatGrams,
      components: hasComponents ? components : undefined,
    });
  }

  return (
    <section
      aria-label="Estimación"
      className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-neutral-900">
            {editing ? "Ajusta las porciones" : estimate.dish}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600">
              Confianza {confidenceLabel(estimate.confidence)}
            </span>
            {mockBadge && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Cálculo local (sin IA)
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

      <p className="mt-3 text-4xl font-bold tracking-tight text-neutral-900">
        ≈ {formatKcal(totals.calories)}
      </p>

      {!hasComponents && estimate.calorieRange && (
        <p className="mt-1 text-sm text-neutral-500">
          {formatKcal(estimate.calorieRange.min)}–{formatKcal(estimate.calorieRange.max)} estimadas
        </p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Macro label="Proteína" value={formatGrams(totals.proteinGrams)} />
        <Macro label="Carbohidratos" value={formatGrams(totals.carbsGrams)} />
        <Macro label="Grasa" value={formatGrams(totals.fatGrams)} />
      </dl>

      {hasComponents ? (
        editing ? (
          <PortionEditor components={components} onUpdate={updateComponent} />
        ) : (
          <PortionSummary components={components} />
        )
      ) : (
        <div className="mt-4 rounded-xl bg-white p-3 text-sm text-neutral-600">
          <p className="font-medium">No pude separar esta comida en porciones editables.</p>
          <p className="mt-1">
            Para afinarla, descríbela con cantidades; por ejemplo: “1 taza de arroz,
            1/2 taza de menestra y 100 g de pollo”.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        Tú corriges qué y cuánto comiste; Calo hace las cuentas de calorías y macros.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-base font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800"
        >
          <PlusIcon className="h-5 w-5" />
          {confirmLabel}
        </button>
        {hasComponents && (
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <EditIcon className="h-5 w-5" />
            {editing ? "Ver resumen" : "Ajustar porciones"}
          </button>
        )}
      </div>
    </section>
  );
}

function PortionSummary({ components }: { components: NutritionComponent[] }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium text-neutral-600">Calculé con estas porciones:</p>
      <div className="space-y-2">
        {components.map((component) => {
          const option = getSelectedUnit(component);
          const value = calculateComponent(component);
          return (
            <div
              key={component.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{component.name}</p>
                <p className="text-sm text-neutral-500">
                  {formatPortionQuantity(component.quantity)} {option.label}
                  {component.assumed && (
                    <span className="ml-2 text-amber-700">· asumido</span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-neutral-700">
                {formatKcal(value.calories)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PortionEditor({
  components,
  onUpdate,
}: {
  components: NutritionComponent[];
  onUpdate: (
    index: number,
    patch: Partial<Pick<NutritionComponent, "quantity" | "unitId">>,
  ) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-neutral-600">
        Corrige las cantidades que realmente comiste. El total cambia al instante.
      </p>
      {components.map((component, index) => {
        const selected = getSelectedUnit(component);
        const value = calculateComponent(component);
        const quickValues =
          component.unitId === "cup"
            ? [
                [0.25, "¼"],
                [1 / 3, "⅓"],
                [0.5, "½"],
                [0.75, "¾"],
                [1, "1"],
              ] as Array<[number, string]>
            : component.unitId === "g"
              ? [
                  [50, "50"],
                  [100, "100"],
                  [150, "150"],
                  [200, "200"],
                ] as Array<[number, string]>
              : [];

        return (
          <div key={component.id} className="rounded-xl bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-neutral-900">{component.name}</p>
              <span className="text-sm font-semibold text-neutral-600">
                {formatKcal(value.calories)}
              </span>
            </div>

            <div className="mt-2 flex gap-2">
              <label className="sr-only" htmlFor={`portion-${component.id}`}>
                Cantidad de {component.name}
              </label>
              <input
                id={`portion-${component.id}`}
                type="number"
                inputMode="decimal"
                min="0.01"
                step={component.unitId === "g" ? "1" : "0.01"}
                value={component.quantity}
                onChange={(event) => {
                  const quantity = Number(event.target.value);
                  if (Number.isFinite(quantity) && quantity > 0) {
                    onUpdate(index, { quantity });
                  }
                }}
                className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              {component.unitOptions.length > 1 ? (
                <select
                  aria-label={`Unidad de ${component.name}`}
                  value={component.unitId}
                  onChange={(event) => onUpdate(index, { unitId: event.target.value })}
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base outline-none focus:border-emerald-500"
                >
                  {component.unitOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex min-w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600">
                  {selected.label}
                </div>
              )}
            </div>

            {quickValues.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickValues.map(([quantity, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onUpdate(index, { quantity })}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    {label} {selected.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
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
