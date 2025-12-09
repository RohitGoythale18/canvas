// src/hooks/useStoredImageLoader.ts
import { useEffect } from 'react';

export const useStoredImageLoader = (
  currentImageId: string | null,
  setUploadedImageUrl: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentImageId: React.Dispatch<React.SetStateAction<string | null>>,
  setLoadedImage: React.Dispatch<React.SetStateAction<HTMLImageElement | null>>
) => {
  useEffect(() => {
    if (!currentImageId) {
      // nothing to load
      setUploadedImageUrl(null);
      setLoadedImage(null);
      return;
    }

    let aborted = false;
    const loadFromServer = async () => {
      try {
        const res = await fetch(`/api/stored-images/${currentImageId}`, { credentials: 'same-origin' });
        if (!res.ok) {
          console.warn('Failed to fetch stored-image metadata from server:', res.status);
          setUploadedImageUrl(null);
          setLoadedImage(null);
          setCurrentImageId(null);
          return;
        }

        const rec = await res.json();
        // If server returns a public URL, load that
        if (rec?.url) {
          const url = rec.url as string;
          if (aborted) return;
          setUploadedImageUrl(url);
          setCurrentImageId(currentImageId);

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            if (aborted) return;
            setLoadedImage(img);
            console.log('Loaded image from server URL:', url);
          };
          img.onerror = () => {
            if (aborted) return;
            console.error('Failed to load image from server URL:', url);
            setUploadedImageUrl(null);
            setLoadedImage(null);
            setCurrentImageId(null);
          };
          img.src = url;
          return;
        }

        try {
          const blobRes = await fetch(`/api/stored-images/${currentImageId}/blob`, { credentials: 'same-origin' });
          if (blobRes.ok) {
            const blob = await blobRes.blob();
            if (aborted) return;
            const blobUrl = URL.createObjectURL(blob);
            setUploadedImageUrl(blobUrl);
            setCurrentImageId(currentImageId);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              if (aborted) return;
              setLoadedImage(img);
              // Optionally revokeObjectURL later when no longer needed
            };
            img.onerror = () => {
              if (aborted) return;
              console.error('Failed to load image from blob response for id:', currentImageId);
              setUploadedImageUrl(null);
              setLoadedImage(null);
              setCurrentImageId(null);
            };
            img.src = blobUrl;
            return;
          } else {
            console.warn('No blob endpoint available or returned non-ok:', blobRes.status);
          }
        } catch (e) {
          console.warn('Attempt to fetch blob failed (no blob endpoint?):', e);
        }

        // If we get here, server had no url or blob available
        console.error('Stored image record did not provide a usable URL or blob for id:', currentImageId);
        setUploadedImageUrl(null);
        setLoadedImage(null);
        setCurrentImageId(null);
      } catch (err) {
        console.error('Error loading stored image from server:', err);
        setUploadedImageUrl(null);
        setLoadedImage(null);
        setCurrentImageId(null);
      }
    };

    loadFromServer();

    return () => {
      aborted = true;
    };
    // NOTE: depend on currentImageId
  }, [currentImageId, setUploadedImageUrl, setCurrentImageId, setLoadedImage]);
};

export default useStoredImageLoader;
