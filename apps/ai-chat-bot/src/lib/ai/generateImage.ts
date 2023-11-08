import { openaiInstance } from ".";
import { fileHandler } from "../server/storage";

type ImageAIModel = "dall-e-2" | "dall-e-3";

type GeneratedImage = {
  imageUrl: string;
};

export async function generateImage({
  prompt,
  userId,
  model = 'dall-e-3',
}: {
  prompt: string;
  userId?: string;
  model?: ImageAIModel;
}): Promise<GeneratedImage[]> {
  const result = await openaiInstance.images.generate({
    prompt,
    n: 1,
    size: "1024x1024",
    model,
    user: userId,
    response_format: "url",
  });

  const openAiImageUrls = result.data.map((x) => x.url!);
  const images: GeneratedImage[] = [];

  for (const imageUrl of openAiImageUrls) {
    const res = await fetch(imageUrl);

    if (!res.ok) {
      const msg = await res.text();
      console.error(`Failed to fetch generated image: ${msg}`);
      throw new Error("Failed to fetch generated image");
    }

    const contentType =
      res.headers.get("content-type") || "application/octet-stream";

    const content = await res.blob();

    try {
      const result = await fileHandler.uploadFile({
        contentType,
        content,
        metadata: {
          prompt,
          userId: userId || "",
        },
      });

      images.push({ imageUrl: result.url });
    } catch (err) {
      console.error(err);
      throw new Error("Failed to upload file");
    }
  }

  return images;
}
