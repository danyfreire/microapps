import { NextResponse } from "next/server";
import { estimateFromImageValidated } from "@/lib/ai/estimator";
import { getEstimator } from "@/lib/ai/provider";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ERROR_COPY =
  "No pude estimarlo bien. Intenta describir la porción o escribe los componentes principales.";

export async function POST(request: Request) {
  const estimator = getEstimator();

  if (estimator.id === "mock") {
    return NextResponse.json(
      { error: "La estimación por foto no está disponible en esta versión. Usa texto." },
      { status: 501 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer la imagen." }, { status: 400 });
  }

  const file = form.get("image");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen supera los 5 MB." }, { status: 413 });
  }

  const context = typeof form.get("context") === "string" ? (form.get("context") as string) : undefined;

  try {
    const estimate = await estimateFromImageValidated(estimator, file, context);
    return NextResponse.json({ estimate, provider: estimator.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: ERROR_COPY }, { status: 502 });
  }
}
