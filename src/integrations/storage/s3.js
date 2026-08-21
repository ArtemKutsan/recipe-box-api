import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '#config/index.js';

const PRESIGNED_URL_EXPIRES_IN = 300;

function buildStorageConfigError() {
  const error = new Error('S3 storage is not configured.');
  error.status = 503;
  error.code = 'STORAGE_NOT_CONFIGURED';
  return error;
}

function getS3Client() {
  if (
    config.storage.provider !== 's3' ||
    !config.storage.awsRegion ||
    !config.storage.awsS3Bucket
  ) {
    throw buildStorageConfigError();
  }

  return new S3Client({ region: config.storage.awsRegion });
}

// Создаём временную ссылку: сам файл потом отправляет frontend прямо в S3.
export async function createPresignedUpload({ fileKey, contentType, sizeBytes }) {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: config.storage.awsS3Bucket,
    Key: fileKey,
    ContentType: contentType,
    ContentLength: sizeBytes,
  });
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  return {
    uploadUrl,
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  };
}

// Создаём временную ссылку на чтение уже загруженного файла.
export async function createPresignedDownload(fileKey) {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.storage.awsS3Bucket,
    Key: fileKey,
  });
  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  return {
    downloadUrl,
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  };
}
