import { NextResponse } from "next/server";
import { estimateTextRequestSchema } from "@/domain/schemas";
import { estimateFromTextValidated } from "@/lib/ai/estimator";
import { getEstimator } from "@/lib/ai/provider";

const ERROR_COPY =
  "No pude estimarlo bien. Intenta describir la porción o escribe los componentes principales.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido." }, { status: 400 });
  }

  const parsed = estimateTextRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Escribe qué comiste para poder estimarlo." },
      { status: 400 },
    );
  }

  const estimator = getEstimator();
  try {
    const estimate = await estimateFromTextValidated(estimator, parsed.data.text);
    return NextResponse.json({ estimate, provider: estimator.id }, { status: 200 });
  } catch {
    return NextResponse.json({ error: ERROR_COPY }, { status: 502 });
  }
}
