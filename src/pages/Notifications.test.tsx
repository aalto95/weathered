import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';
import { makeFavorite, renderWithProviders } from '../test-utils';
import Notifications from './Notifications';

const renderPage = (favorites = [makeFavorite()]) =>
  renderWithProviders(
    <MemoryRouter>
      <Notifications />
    </MemoryRouter>,
    { appState: { favorites } }
  );

describe('Notifications page', () => {
  test('prompts for favorites when there are none', () => {
    renderPage([]);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Notifications' })
    ).toBeInTheDocument();
    expect(screen.getByText('No favorite cities yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  test('shows the delivery controls for saved favorites', () => {
    renderPage();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    expect(screen.getByLabelText('Delivery time')).toHaveValue('08:00');
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText(timezone)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enable daily notifications' })
    ).toBeDisabled();
  });

  test('explains why notifications are unavailable in this environment', () => {
    renderPage();

    expect(
      screen.getByText(
        /Notifications are not configured|does not support push notifications/i
      )
    ).toBeInTheDocument();
  });
});
