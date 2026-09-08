import { createUploadUrl, getMediaDownloadUrl } from '#modules/uploads/service.js';
import { validateMediaFileKey, validatePresignedUpload } from './validation.js';

export async function createPresignedUpload(req, res, next) {
  try {
    const payload = validatePresignedUpload(req.body);
    const result = await createUploadUrl(payload, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function createPresignedDownload(req, res, next) {
  try {
    const fileKey = validateMediaFileKey(req.query.fileKey);
    const result = await getMediaDownloadUrl(fileKey, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
