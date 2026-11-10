import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { weatherAPI } from '../api/api';
import i18n from '../i18n';
import { makeCity, renderWithProviders } from '../test-utils';
import { Sidebar } from './Sidebar';

vi.mock('../api/api', () => ({
  weatherAPI: {
    getCityByName: vi.fn(),
    getCityByCoords: vi.fn(),
    getMultipleCities: vi.fn()
  }
}));

const getCityByName = vi.mocked(weatherAPI.getCityByName);

const renderSidebar = (startPath = '/') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[startPath]}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<div>Home page</div>} />
        <Route path="/favorites" element={<div>Favorites page</div>} />
      </Routes>
    </MemoryRouter>,
    {
      appState: {
        isSidebarOpen: true,
        city: makeCity()
      }
    }
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sidebar', () => {
  test('navigates to favorites and closes itself', async () => {
    const user = userEvent.setup();
    const { store } = renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Favorites' }));

    expect(screen.getByText('Favorites page')).toBeInTheDocument();
    expect(store.getState().app.isSidebarOpen).toBe(false);
  });

  test('navigates home from the favorites route', async () => {
    const user = userEvent.setup();
    const { store } = renderSidebar('/favorites');

    await user.click(screen.getByRole('button', { name: 'Home' }));

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(store.getState().app.isSidebarOpen).toBe(false);
  });

  test('switches the language and refreshes the current city', async () => {
    const user = userEvent.setup();
    getCityByName.mockResolvedValue(makeCity());
    renderSidebar();

    await user.click(screen.getByRole('button', { name: /Switch to Russian/ }));

    await waitFor(() => expect(i18n.language).toBe('ru'));
    expect(localStorage.getItem('lang')).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
    expect(getCityByName).toHaveBeenCalledWith('Berlin', 'ru');
  });

  test('closes with the close button', async () => {
    const user = userEvent.setup();
    const { store } = renderSidebar();

    await user.click(screen.getByRole('button', { name: 'Close menu' }));

    expect(store.getState().app.isSidebarOpen).toBe(false);
  });

  test('closes on Escape and restores body scrolling', async () => {
    const { store } = renderSidebar();

    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(store.getState().app.isSidebarOpen).toBe(false);
    await waitFor(() => expect(document.body.style.overflow).toBe(''));
  });
});
