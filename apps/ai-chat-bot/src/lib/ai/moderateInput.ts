import { openaiInstance } from ".";

export async function moderateInput(input: string) {
  const result = await openaiInstance.moderations.create({
    input,
  });

  const isFlagged = result.results.some((x) => x.flagged);
  return !isFlagged;
}
