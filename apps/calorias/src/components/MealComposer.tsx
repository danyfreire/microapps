"use client";

import { useState } from "react";
import { CameraIcon } from "./icons";

interface MealComposerProps {
  estimating: boolean;
  onEstimate: (text: string) => void;
  onPhoto: () => void;
}

export function MealComposer({ estimating, onEstimate, onPhoto }: MealComposerProps) {
  const [text, setText] = useState("");
  const canSubmit = text.trim().length > 0 && !estimating;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onEstimate(text.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="meal-input" className="block text-base font-semibold text-neutral-900">
        ¿Qué comiste?
      </label>
      <textarea
        id="meal-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ej: arroz con menestra, carne y 3 patacones"
        rows={3}
        autoComplete="off"
        className="w-full resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-emerald-600 px-5 text-base font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {estimating ? "Estimando…" : "Estimar"}
        </button>
        <button
          type="button"
          onClick={onPhoto}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          aria-label="Estimar por foto (próximamente)"
        >
          <CameraIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Foto</span>
        </button>
      </div>
    </form>
  );
}
