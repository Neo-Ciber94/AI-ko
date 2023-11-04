import { S3FileUploader } from "./s3FileUploader";

export type UploadData = {
  content: Blob;
  contentType: string;
  metadata?: Record<string, string>;
};

export type UploadFileResult = { url: string };

export interface FileUploader {
  uploadFile(file: UploadData): Promise<UploadFileResult>;
}

export const fileHandler: FileUploader = new S3FileUploader();
