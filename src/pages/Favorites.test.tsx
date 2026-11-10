import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { weatherAPI } from '../api/api';
import { makeCity, makeFavorite, renderWithProviders } from '../test-utils';
import Favorites from './Favorites';

vi.mock('../api/api', () => ({
  weatherAPI: {
    getCityByName: vi.fn(),
    getCityByCoords: vi.fn(),
    getMultipleCities: vi.fn()
  }
}));

vi.mock('../components/RiveAnimation', () => ({
  RiveAnimation: ({ animationName }: { animationName: string }) => (
    <div data-testid={`rive-${animationName}`} />
  )
}));

const getMultipleCities = vi.mocked(weatherAPI.getMultipleCities);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Favorites', () => {
  test('shows the empty state when there are no favorites', async () => {
    getMultipleCities.mockResolvedValue([]);
    renderWithProviders(<Favorites />, { appState: { favorites: [] } });

    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    expect(
      screen.getByText(/Search for a city and tap the star/)
    ).toBeInTheDocument();
    await waitFor(() => expect(getMultipleCities).toHaveBeenCalledWith([]));
  });

  test('loads and renders the saved cities', async () => {
    const favorites = [makeFavorite()];
    const cities = [makeCity()];
    getMultipleCities.mockResolvedValue(cities);

    renderWithProviders(<Favorites />, { appState: { favorites } });

    expect(
      await screen.findByRole('heading', { name: /Berlin/ })
    ).toBeInTheDocument();
    expect(getMultipleCities).toHaveBeenCalledWith(favorites);
  });

  test('shows the loader while the favorites request is pending', async () => {
    const favorites = [makeFavorite()];
    getMultipleCities.mockImplementation(
      () => new Promise<never>(() => undefined)
    );

    renderWithProviders(<Favorites />, { appState: { favorites } });

    expect(await screen.findByTestId('rive-loading')).toBeInTheDocument();
  });

  test('shows the 404 animation when the favorites request fails', async () => {
    const favorites = [makeFavorite()];
    getMultipleCities.mockRejectedValue(new Error('network down'));

    renderWithProviders(<Favorites />, { appState: { favorites } });

    expect(await screen.findByTestId('rive-404')).toBeInTheDocument();
  });
});
