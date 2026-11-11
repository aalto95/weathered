import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Dispatch, SetStateAction } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../test-utils';
import { PwaUpdateNotification } from './PwaUpdateNotification';

const useRegisterSWMock = vi.mocked(useRegisterSW);
type NeedRefresh = [boolean, Dispatch<SetStateAction<boolean>>];

const mockUpdateState = (needRefresh: boolean) => {
  const setNeedRefresh = vi.fn();
  const updateServiceWorker = vi.fn().mockResolvedValue(undefined);

  useRegisterSWMock.mockReturnValue({
    needRefresh: [needRefresh, setNeedRefresh] as NeedRefresh,
    offlineReady: [false, vi.fn()] as NeedRefresh,
    updateServiceWorker
  });

  return { setNeedRefresh, updateServiceWorker };
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PwaUpdateNotification', () => {
  test('renders nothing when the app is up to date', () => {
    mockUpdateState(false);

    const { container } = renderWithProviders(<PwaUpdateNotification />);

    expect(container).toBeEmptyDOMElement();
  });

  test('shows the update actions when a new version is waiting', () => {
    mockUpdateState(true);

    renderWithProviders(<PwaUpdateNotification />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'A new version of Weathered is available.'
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument();
  });

  test('activates the waiting service worker when updated', async () => {
    const user = userEvent.setup();
    const { updateServiceWorker } = mockUpdateState(true);
    renderWithProviders(<PwaUpdateNotification />);

    await user.click(screen.getByRole('button', { name: 'Update' }));

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  test('hides the prompt when dismissed', async () => {
    const user = userEvent.setup();
    const { setNeedRefresh } = mockUpdateState(true);
    renderWithProviders(<PwaUpdateNotification />);

    await user.click(screen.getByRole('button', { name: 'Later' }));

    expect(setNeedRefresh).toHaveBeenCalledWith(false);
  });

  test('checks for updates periodically and when the app becomes visible', () => {
    vi.useFakeTimers();
    const update = vi.fn().mockResolvedValue(undefined);
    const registration = { update } as unknown as ServiceWorkerRegistration;

    useRegisterSWMock.mockImplementation((options) => {
      options?.onRegisteredSW?.('/sw.js', registration);
      return {
        needRefresh: [false, vi.fn()] as NeedRefresh,
        offlineReady: [false, vi.fn()] as NeedRefresh,
        updateServiceWorker: vi.fn()
      };
    });
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    renderWithProviders(<PwaUpdateNotification />);

    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(update).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(update).toHaveBeenCalledTimes(2);
  });
});
