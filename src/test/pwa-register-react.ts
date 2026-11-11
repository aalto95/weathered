import { useState } from 'react';

/**
 * Vitest alias for `virtual:pwa-register/react`. VitePWA provides the real
 * virtual module during a Vite build; tests only need the import to resolve.
 */
export interface RegisterSWOptions {
  onRegisteredSW?: (
    swScriptUrl: string,
    registration: ServiceWorkerRegistration | undefined
  ) => void;
}

export const useRegisterSW = (_options?: RegisterSWOptions) => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  return {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker: async () => {
      setNeedRefresh(false);
    }
  };
};
