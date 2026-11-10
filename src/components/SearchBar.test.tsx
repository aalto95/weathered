import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { weatherAPI } from '../api/api';
import { makeCity, renderWithProviders } from '../test-utils';
import { SearchBar } from './SearchBar';

vi.mock('../api/api', () => ({
  weatherAPI: {
    getCityByName: vi.fn(),
    getCityByCoords: vi.fn(),
    getMultipleCities: vi.fn()
  }
}));

const getCityByName = vi.mocked(weatherAPI.getCityByName);
const searchButton = () =>
  screen.getByRole('button', { name: 'Search for a city' });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SearchBar', () => {
  test('submits the trimmed city name', async () => {
    const user = userEvent.setup();
    getCityByName.mockResolvedValue(makeCity());
    const { store } = renderWithProviders(<SearchBar />);

    const input = screen.getByRole('textbox', { name: 'Search for a city' });
    await user.type(input, '  Berlin  ');
    await user.click(searchButton());

    await waitFor(() =>
      expect(getCityByName).toHaveBeenCalledWith('Berlin', 'en')
    );
    await waitFor(() => expect(store.getState().app.city?.name).toBe('Berlin'));
  });

  test('does not submit an empty or whitespace-only value', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);

    expect(searchButton()).toBeDisabled();

    await user.type(
      screen.getByRole('textbox', { name: 'Search for a city' }),
      '   '
    );

    expect(searchButton()).toBeDisabled();
    expect(getCityByName).not.toHaveBeenCalled();
  });

  test('clears the input with the clear button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);

    const input = screen.getByRole('textbox', { name: 'Search for a city' });
    await user.type(input, 'Berlin');
    expect(input).toHaveValue('Berlin');

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(input).toHaveValue('');
    expect(
      screen.queryByRole('button', { name: 'Clear search' })
    ).not.toBeInTheDocument();
  });

  test('disables the submit button while a request is in flight', () => {
    renderWithProviders(<SearchBar />, { appState: { isFetching: true } });

    expect(searchButton()).toBeDisabled();
  });

  test('re-enables submission after a failed search', async () => {
    const user = userEvent.setup();
    getCityByName.mockRejectedValue(new Error('not found'));
    renderWithProviders(<SearchBar />);

    await user.type(
      screen.getByRole('textbox', { name: 'Search for a city' }),
      'Nowhere'
    );
    await user.click(searchButton());

    await waitFor(() => expect(searchButton()).not.toBeDisabled());
  });
});
