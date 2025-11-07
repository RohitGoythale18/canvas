import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

// On the client side, create a meta tag at the top of the <head> and hydrate
export default function createEmotionCache() {
  let insertionPoint;

  if (isBrowser) {
    // A meta tag with name="emotion-insertion-point" at the top of the <head>
    // This is required for MUI to work properly with SSR
    const emotionInsertionPoint = document.querySelector(
      'meta[name="emotion-insertion-point"]',
    ) as HTMLElement;
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  return createCache({ key: 'mui', insertionPoint });
}
