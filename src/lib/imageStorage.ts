// pseudo inside imageStorage.upload(base64, filename, ownerId)
import { api } from './api';

export async function uploadBase64Image(base64Data: string, fileName: string, ownerId?: string) {
  const body = {
    fileName,
    mimeType: base64Data.substring(5, base64Data.indexOf(';')),
    base64Data,
    ownerId
  };
  const saved = await api.post('/stored-images', body);
  // saved.id, saved.url
  return saved; // return id & url to UI
}
