import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { renderWithProviders } from '../test-utils';
import { AddToHomeScreenNotification } from './AddToHomeScreenNotification';

interface BeforeInstallPromptEvent extends Event {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const createPromptEvent = (): BeforeInstallPromptEvent => {
  const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;

  Object.defineProperties(event, {
    prompt: {
      value: vi.fn().mockResolvedValue(undefined)
    },
    userChoice: {
      value: Promise.resolve({ outcome: 'accepted', platform: 'web' })
    }
  });

  return event;
};

const displayPrompt = (event = createPromptEvent()) => {
  act(() => {
    window.dispatchEvent(event);
  });
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  return event;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AddToHomeScreenNotification', () => {
  test('renders nothing until the browser offers installation', () => {
    const { container } = renderWithProviders(<AddToHomeScreenNotification />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(container).toBeEmptyDOMElement();
  });

  test('shows the install and dismiss actions once prompted', () => {
    renderWithProviders(<AddToHomeScreenNotification />);

    displayPrompt();

    expect(
      screen.getByRole('button', { name: 'Install this app' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  test('triggers the browser install prompt', async () => {
    renderWithProviders(<AddToHomeScreenNotification />);
    const event = displayPrompt();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Install this app' }));
      await Promise.resolve();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Install this app' })
    ).not.toBeInTheDocument();
  });

  test('dismisses the notification and remembers the choice', async () => {
    const { store } = renderWithProviders(<AddToHomeScreenNotification />);
    displayPrompt();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(store.getState().app.isA2HSButtonDismissed).toBe(true);
    expect(localStorage.getItem('a2hsButtonDismissed')).toBe('true');
  });

  test('stays hidden when the notification was dismissed before', async () => {
    localStorage.setItem('a2hsButtonDismissed', 'true');
    renderWithProviders(<AddToHomeScreenNotification />);

    await act(async () => {
      await Promise.resolve();
    });
    displayPrompt();

    expect(
      screen.queryByRole('button', { name: 'Install this app' })
    ).not.toBeInTheDocument();
  });
});
