import { describe, expect, test } from 'vitest';
import i18n from '../i18n';
import { getWmoInfo } from './wmo';

const knownCodes = [
  0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77,
  80, 81, 82, 85, 86, 95, 96, 99
];

describe('getWmoInfo', () => {
  test.each(knownCodes)(
    'maps WMO code %i to an animation and i18n key',
    (code) => {
      const info = getWmoInfo(code);

      expect(info.animation).toBeTruthy();
      expect(info.description).toMatch(/^weather\.[a-zA-Z]+$/);
    }
  );

  test.each(knownCodes)(
    'has EN and RU translations for WMO code %i',
    (code) => {
      const { description } = getWmoInfo(code);

      expect(i18n.getResource('en', 'translation', description)).toBeTruthy();
      expect(i18n.getResource('ru', 'translation', description)).toBeTruthy();
    }
  );

  test('falls back to a generic condition for unknown codes', () => {
    expect(getWmoInfo(1234)).toEqual({
      animation: 'clouds',
      description: 'weather.unknown'
    });
  });
});
