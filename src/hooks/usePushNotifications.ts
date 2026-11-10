import { useCallback, useEffect, useState } from 'react';
import {
  NotificationLang,
  removeNotificationSubscription,
  saveNotificationSubscription,
  sendTestNotification
} from '../api/notifications';
import { FavoriteLocation } from '../models/weather.model';

const STORAGE_KEY = 'weathered:notifications';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  string | undefined;

interface StoredSettings {
  id: string;
  time: string;
  timezone: string;
}

export type NotificationBlockedReason =
  'unsupported' | 'missing-config' | 'ios-install' | 'denied';

const readSettings = (): StoredSettings | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    if (
      typeof parsed.id === 'string' &&
      typeof parsed.time === 'string' &&
      typeof parsed.timezone === 'string'
    ) {
      return {
        id: parsed.id,
        time: parsed.time,
        timezone: parsed.timezone
      };
    }
  } catch {
    // Ignore malformed storage.
  }
  return null;
};

const writeSettings = (settings: StoredSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const clearSettings = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const environmentSupported = () =>
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  Boolean(VAPID_PUBLIC_KEY);

const getRegistration = () => navigator.serviceWorker.ready;

const getPushSubscription = async () => {
  const registration = await getRegistration();
  return registration.pushManager.getSubscription();
};

const subscribeToPush = async () => {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Notifications are not configured');
  }

  const registration = await getRegistration();
  const existing = await registration.pushManager.getSubscription();

  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY
    ) as BufferSource
  });
};

const getBlockedReason = (): NotificationBlockedReason | null => {
  if (!environmentSupported()) {
    if ('Notification' in window && !VAPID_PUBLIC_KEY) {
      return 'missing-config';
    }
    return 'unsupported';
  }

  if (isIos() && !isStandalone()) {
    return 'ios-install';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return null;
};

export const usePushNotifications = () => {
  const [supported] = useState(environmentSupported);
  const [permission, setPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'default'
  );
  const [settings, setSettings] = useState<StoredSettings | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedReason, setBlockedReason] =
    useState<NotificationBlockedReason | null>(getBlockedReason);

  useEffect(() => {
    let cancelled = false;
    const stored = readSettings();

    if (!stored || !environmentSupported()) {
      return;
    }

    setSettings(stored);

    getPushSubscription()
      .then((subscription) => {
        if (cancelled) {
          return;
        }
        if (subscription) {
          setSubscribed(true);
        } else {
          clearSettings();
          setSettings(null);
        }
      })
      .catch(() => {
        // A missing service worker or push support just leaves the UI disabled.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const enable = useCallback(
    async (
      time: string,
      timezone: string,
      favorites: FavoriteLocation[],
      lang: NotificationLang
    ) => {
      setBusy(true);
      setError(null);

      try {
        if (getBlockedReason()) {
          setBlockedReason(getBlockedReason());
          throw new Error('Notifications are not available in this browser');
        }

        if (favorites.length === 0) {
          throw new Error('Add at least one favorite city first');
        }

        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);

        if (permissionResult !== 'granted') {
          setBlockedReason(permissionResult === 'denied' ? 'denied' : null);
          throw new Error('Notification permission was not granted');
        }

        const subscription = await subscribeToPush();
        const response = await saveNotificationSubscription({
          id: settings?.id,
          subscription: subscription.toJSON(),
          time,
          timezone,
          favorites,
          lang
        });

        const nextSettings = { id: response.id, time, timezone };
        writeSettings(nextSettings);
        setSettings(nextSettings);
        setSubscribed(true);
        setBlockedReason(null);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Could not save settings'
        );
        throw caught;
      } finally {
        setBusy(false);
      }
    },
    [settings?.id]
  );

  const disable = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const stored = settings ?? readSettings();
      if (stored) {
        await removeNotificationSubscription(stored.id).catch(() => undefined);
      }

      const subscription = await getPushSubscription().catch(() => null);
      await subscription?.unsubscribe().catch(() => undefined);

      clearSettings();
      setSettings(null);
      setSubscribed(false);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not disable notifications'
      );
      throw caught;
    } finally {
      setBusy(false);
    }
  }, [settings]);

  const test = useCallback(async () => {
    const stored = settings ?? readSettings();
    if (!stored) {
      throw new Error('Enable notifications first');
    }

    setBusy(true);
    setError(null);

    try {
      await sendTestNotification(stored.id);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Could not send a test'
      );
      throw caught;
    } finally {
      setBusy(false);
    }
  }, [settings]);

  return {
    supported,
    permission,
    blockedReason,
    subscribed,
    busy,
    error,
    settings,
    enable,
    disable,
    test
  };
};

export const useNotificationAutoSync = (
  favorites: FavoriteLocation[],
  lang: NotificationLang
) => {
  useEffect(() => {
    const stored = readSettings();
    if (!stored || !environmentSupported()) {
      return;
    }

    let cancelled = false;

    getPushSubscription()
      .then((subscription) => {
        if (!subscription || cancelled) {
          return;
        }

        return saveNotificationSubscription({
          id: stored.id,
          subscription: subscription.toJSON(),
          time: stored.time,
          timezone: stored.timezone,
          favorites,
          lang
        });
      })
      .catch(() => {
        // Background sync is best-effort; the settings screen surfaces errors.
      });

    return () => {
      cancelled = true;
    };
  }, [favorites, lang]);
};
