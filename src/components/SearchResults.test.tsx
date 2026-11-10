import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { makeCity, makeFavorite, renderWithProviders } from '../test-utils';
import SearchResults from './SearchResults';

vi.mock('./RiveAnimation', () => ({
  RiveAnimation: ({ animationName }: { animationName: string }) => (
    <div data-testid={`rive-${animationName}`} />
  )
}));

const renderCity = (
  overrides: Parameters<typeof makeCity>[0] = {},
  appState: Parameters<typeof renderWithProviders>[1] = {}
) =>
  renderWithProviders(
    <SearchResults
      city={makeCity(overrides)}
      fetchError={false}
      isFetching={false}
    />,
    appState
  );

describe('SearchResults', () => {
  test('renders the current conditions', () => {
    renderCity();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Berlin, Germany'
    );
    expect(screen.getByText('°C').parentElement).toHaveTextContent('5°C');
    expect(screen.getByText('Overcast')).toBeInTheDocument();
    expect(screen.getByText(/Feels like 2°C/)).toBeInTheDocument();
    expect(screen.getByText('26.6 km')).toBeInTheDocument();
    expect(screen.getByText(/7 km\/h/)).toBeInTheDocument();
    expect(screen.getByText('1008 hPa')).toBeInTheDocument();
    expect(screen.getByText('0.2 mm')).toBeInTheDocument();
    expect(screen.getByText('07:19')).toBeInTheDocument();
    expect(screen.getByText('81%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('16:20')).toBeInTheDocument();
    expect(screen.getByTestId('rive-clouds')).toBeInTheDocument();
  });

  test('renders hourly and daily forecasts', () => {
    renderCity();

    expect(screen.getByText('Hourly forecast')).toBeInTheDocument();
    expect(screen.getByText('7-day forecast')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText(/Updated 14:45/)).toBeInTheDocument();
  });

  test('can hide forecasts for compact cards', () => {
    renderWithProviders(
      <SearchResults
        city={makeCity()}
        fetchError={false}
        isFetching={false}
        showForecast={false}
      />
    );

    expect(screen.queryByText('Hourly forecast')).not.toBeInTheDocument();
    expect(screen.queryByText('7-day forecast')).not.toBeInTheDocument();
  });

  test('links to the location on Google Maps', () => {
    renderCity();

    expect(screen.getByRole('link', { name: /View on map/ })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/place/52.52%2C13.41'
    );
  });

  test('adds the city to favorites', async () => {
    const user = userEvent.setup();
    const { store } = renderCity();

    const button = screen.getByRole('button', { name: 'Add to favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);

    expect(store.getState().app.favorites).toEqual([
      {
        id: 1,
        name: 'Berlin',
        country: 'DE',
        latitude: 52.52,
        longitude: 13.41
      }
    ]);
    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('removes an existing favorite', async () => {
    const user = userEvent.setup();
    const favorite = makeFavorite();
    const { store } = renderCity({}, { appState: { favorites: [favorite] } });

    await user.click(
      screen.getByRole('button', { name: 'Remove from favorites' })
    );

    expect(store.getState().app.favorites).toEqual([]);
    expect(
      screen.getByRole('button', { name: 'Add to favorites' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  test('recognizes a favorite by coordinates when the id differs', () => {
    renderCity({}, { appState: { favorites: [makeFavorite({ id: 999 })] } });

    expect(
      screen.getByRole('button', { name: 'Remove from favorites' })
    ).toBeInTheDocument();
  });

  test('falls back to “My location” when the place has no name', () => {
    renderCity({ name: '', country: '' });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'My location'
    );
  });

  test('shows the loading animation', () => {
    renderWithProviders(
      <SearchResults city={null} fetchError={false} isFetching={true} />
    );

    expect(screen.getByTestId('rive-loading')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  test('shows the 404 animation on error', () => {
    renderWithProviders(
      <SearchResults city={null} fetchError={true} isFetching={false} />
    );

    expect(screen.getByTestId('rive-404')).toBeInTheDocument();
  });

  test('renders nothing when there is no city, error, or request', () => {
    const { container } = renderWithProviders(
      <SearchResults city={null} fetchError={false} isFetching={false} />
    );

    expect(container.querySelector('article')).toBeNull();
  });
});
