import { useEffect } from 'react';

export const useStoredImageLoader = (
  setUploadedImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentImageId: React.Dispatch<React.SetStateAction<string | null>>,
  setLoadedImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
) => {
  useEffect(() => {
    const loadStoredImage = async () => {
      const storedImageId = localStorage.getItem('currentImageId');
      if (storedImageId) {
        try {
          const { imageStorage } = await import('../lib/imageStorage');
          const blob = await imageStorage.getImage(storedImageId);
          if (blob) {
            console.log('Retrieved blob from IndexedDB, size:', blob.size);
            const blobUrl = URL.createObjectURL(blob);
            setUploadedImageUrl(blobUrl);
            setCurrentImageId(storedImageId);
            const img = new Image();
            img.onload = () => {
              console.log('Stored image loaded successfully');
              setLoadedImage(img);
            };
            img.onerror = () => {
              console.error('Failed to load stored image');
              setUploadedImageUrl(null);
              setLoadedImage(null);
              setCurrentImageId(null);
            };
            img.src = blobUrl;
          } else {
            console.warn('No blob found for storedImageId:', storedImageId);
          }
        } catch (error) {
          console.error('Error loading stored image:', error);
        }
      }
    };

    loadStoredImage();
  }, [setUploadedImageUrl, setCurrentImageId, setLoadedImage]);
};
