import { openaiInstance } from ".";

export async function generateImage({
  prompt,
  userId,
}: {
  prompt: string;
  userId?: string;
}) {
  const result = await openaiInstance.images.generate({
    prompt,
    n: 1,
    user: userId,
    response_format: "b64_json",
  });

  const images = result.data.map((x) => x.b64_json!);
  return {
    images,
  };
}
