import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import 'vitest-canvas-mock';
import i18n from './src/i18n';

// Rive paints to a canvas, which isn't meaningful in unit tests. Stub the
// hook so components render their surrounding markup without fetching assets.
vi.mock('@rive-app/react-canvas', () => ({
  Alignment: { Center: 'center' },
  Fit: { FitWidth: 'fitWidth' },
  Layout: vi.fn(),
  useRive: () => ({ RiveComponent: () => null })
}));

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('en');

  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', '#000000');
    document.head.appendChild(meta);
  }
});

afterEach(() => {
  cleanup();
});
