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
    size: "256x256",
    user: userId,
    response_format: "b64_json",
  });

  const images = result.data.map(
    (x) => `data:image/png;base64, ${x.b64_json}`!,
  );

  return {
    images,
  };
}
