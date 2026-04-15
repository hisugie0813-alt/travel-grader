import { GradingResult } from "../types";

export async function gradeTravelogue(text: string): Promise<GradingResult> {
  const response = await fetch("/api/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to grade");
  }

  return await response.json();
}
