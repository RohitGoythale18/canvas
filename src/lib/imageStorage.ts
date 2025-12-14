// pseudo inside imageStorage.upload(base64, filename, ownerId)
// TODO: Implement image storage API integration

export async function uploadBase64Image(base64Data: string, fileName: string, ownerId?: string) {
  // Stub implementation - API route not yet implemented
  throw new Error('Image storage API not implemented yet');
  
  // Future implementation:
  // const body = {
  //   fileName,
  //   mimeType: base64Data.substring(5, base64Data.indexOf(';')),
  //   base64Data,
  //   ownerId
  // };
  // const res = await fetch('/api/stored-images', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(body)
  // });
  // const saved = await res.json();
  // return saved; // return id & url to UI
}
