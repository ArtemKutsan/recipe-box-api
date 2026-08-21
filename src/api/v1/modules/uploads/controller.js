import { createUploadUrl } from './service.js';
import { validatePresignedUpload } from './validation.js';

export async function createPresignedUpload(req, res, next) {
  try {
    const payload = validatePresignedUpload(req.body);
    const result = await createUploadUrl(payload, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
