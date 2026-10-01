"use client";

import { useEffect, useState } from "react";
import { localDayKey } from "@/domain/nutrition";
import { track } from "@/lib/analytics";
import { promptInstall } from "@/lib/pwa";
import { clearAllData, clearDay, getSettings, saveSettings } from "@/lib/storage";

const APP_VERSION = "0.1.0";

export default function SettingsPage() {
  const [goalInput, setGoalInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const settings = getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leer estado persistido (localStorage) solo es posible en el cliente, tras el montaje
    setGoalInput(settings.calorieGoal != null ? String(settings.calorieGoal) : "");
  }, []);

  function handleSaveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = goalInput.trim();

    if (trimmed === "") {
      saveSettings({});
      setMessage("Objetivo eliminado.");
      track("goal_saved");
      return;
    }

    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0 || n > 20000) {
      setMessage("Ingresa un objetivo válido entre 0 y 20000 kcal.");
      return;
    }

    const goal = Math.round(n);
    saveSettings({ calorieGoal: goal });
    setMessage("Objetivo guardado.");
    track("goal_saved");
  }

  async function handleClearDay() {
    if (!window.confirm("¿Borrar todas las comidas de hoy?")) return;
    await clearDay(localDayKey());
    setMessage("Comidas de hoy eliminadas.");
  }

  async function handleClearAll() {
    if (!window.confirm("¿Borrar TODOS los datos locales? Esta acción no se puede deshacer.")) {
      return;
    }
    await clearAllData();
    setGoalInput("");
    setMessage("Todos los datos locales fueron eliminados.");
  }

  async function handleInstall() {
    const accepted = await promptInstall();
    if (accepted) {
      setMessage("App instalada.");
      track("pwa_installed");
    } else {
      setMessage(
        "Para instalar: usa el menú de tu navegador y elige “Añadir a pantalla de inicio”.",
      );
    }
  }

  return (
    <div className="space-y-6 p-4 pb-8">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ajustes</h1>
      </header>

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <section aria-label="Objetivo diario" className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900">Objetivo diario</h2>
        <p className="text-sm text-neutral-500">
          Opcional. Indica tus propias calorías por día; no lo calculamos por ti.
        </p>
        <form onSubmit={handleSaveGoal} className="flex gap-2">
          <label htmlFor="goal" className="sr-only">
            Objetivo en kcal
          </label>
          <input
            id="goal"
            type="number"
            inputMode="numeric"
            min="0"
            max="20000"
            placeholder="Ej: 2000"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Guardar
          </button>
        </form>
      </section>

      <section aria-label="Instalar app" className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900">Instalar app</h2>
        <p className="text-sm text-neutral-500">
          Calo funciona sin conexión y se puede instalar en tu teléfono.
        </p>
        <button
          type="button"
          onClick={handleInstall}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
        >
          Instalar app
        </button>
      </section>

      <section aria-label="Privacidad" className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900">Privacidad</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-neutral-500">
          <li>Tu diario se guarda solo en este dispositivo.</li>
          <li>Sin cuenta, sin registro y sin email.</li>
          <li>No guardamos tus fotos ni el texto de tus comidas en el servidor.</li>
        </ul>
      </section>

      <section aria-label="Acerca de las estimaciones" className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900">Acerca de las estimaciones</h2>
        <p className="text-sm text-neutral-500">
          Las calorías y macronutrientes son estimaciones aproximadas, no mediciones exactas.
          Calo no es un dispositivo médico ni sustituye el consejo de un profesional de la salud.
        </p>
      </section>

      <section aria-label="Datos" className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900">Datos</h2>
        <button
          type="button"
          onClick={handleClearDay}
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
        >
          Borrar comidas de hoy
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-base font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Borrar todos los datos locales
        </button>
      </section>

      <p className="pt-2 text-center text-xs text-neutral-400">Calo v{APP_VERSION}</p>
    </div>
  );
}
