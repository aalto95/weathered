import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import App from './App';
import { makeFavorite, renderWithProviders } from './test-utils';

vi.mock('./api/api', () => ({
  weatherAPI: {
    getCityByName: vi.fn(),
    getCityByCoords: vi.fn(),
    getMultipleCities: vi.fn()
  }
}));

describe('App', () => {
  test('renders the header, search bar, and attribution', () => {
    renderWithProviders(<App />);

    expect(screen.getAllByText('Weathered').length).toBeGreaterThan(0);
    expect(
      screen.getByPlaceholderText('Search for a city')
    ).toBeInTheDocument();
    expect(screen.getByText(/Weather data by/)).toBeInTheDocument();
  });

  test('restores valid favorites and removes the legacy storage key', async () => {
    const favorite = makeFavorite();
    localStorage.setItem(
      'favorites',
      JSON.stringify([favorite, { not: 'a favorite' }])
    );
    localStorage.setItem('favoritesIds', '[1,2]');

    const { store } = renderWithProviders(<App />);

    await waitFor(() =>
      expect(store.getState().app.favorites).toEqual([favorite])
    );
    expect(localStorage.getItem('favoritesIds')).toBeNull();
  });

  test('ignores malformed favorites storage', async () => {
    localStorage.setItem('favorites', '{not valid json');

    const { store } = renderWithProviders(<App />);

    await waitFor(() => expect(store.getState().app.favorites).toEqual([]));
    expect(
      await screen.findByPlaceholderText('Search for a city')
    ).toBeInTheDocument();
  });

  test('defaults the language to English and the theme to light', async () => {
    const { store } = renderWithProviders(<App />);

    await waitFor(() => expect(localStorage.getItem('lang')).toBe('en'));
    await waitFor(() => expect(store.getState().app.mode).toBe('light'));
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  test('applies a stored language to the document', async () => {
    localStorage.setItem('lang', 'ru');

    renderWithProviders(<App />);

    await waitFor(() => expect(document.documentElement.lang).toBe('ru'));
  });

  test('toggles the theme from the header', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<App />);

    await waitFor(() => expect(localStorage.getItem('mode')).toBe('light'));
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));

    await waitFor(() => expect(store.getState().app.mode).toBe('dark'));
    expect(localStorage.getItem('mode')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
