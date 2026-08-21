import { randomUUID } from 'node:crypto';
import { createPresignedUpload } from '#integrations/storage/s3.js';

export async function createUploadUrl(payload, user) {
  const fileKey = `${payload.folder}/${user._id.toString()}/${randomUUID()}.${payload.extension}`;
  const result = await createPresignedUpload({
    fileKey,
    contentType: payload.contentType,
    sizeBytes: payload.sizeBytes,
  });

  return {
    ...result,
    fileKey,
    contentType: payload.contentType,
    sizeBytes: payload.sizeBytes,
  };
}
