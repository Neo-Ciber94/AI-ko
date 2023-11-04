import { env } from "@/lib/env";
import type { FileUploader, UploadData, UploadFileResult } from ".";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: env.APP_AWS_REGION,
  credentials: {
    accessKeyId: env.APP_AWS_ACCESS_KEY,
    secretAccessKey: env.APP_AWS_SECRET_KEY,
  },
});

export class S3FileUploader implements FileUploader {
  async uploadFile(file: UploadData): Promise<UploadFileResult> {
    const parts = file.contentType.split("/");
    if (parts.length !== 2) {
      throw new Error("Invalid content type, expected '<type>/<extension>'");
    }

    const ext = parts[1];
    const objectKey = `/images/${crypto.randomUUID()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.APP_AWS_BUCKET,
        Key: objectKey,
        Body: file.content,
        ContentType: file.contentType,
        Metadata: file.metadata,
      }),
    );

    return {
      url: `https://${env.PUBLIC_APP_AWS_CLOUDFRONT_DOMAIN}/${objectKey}`,
    };
  }
}
