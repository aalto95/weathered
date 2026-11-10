import { describe, expect, test } from 'vitest';
import { parseId, parseSubscribePayload, ValidationError } from './validation';

const validPayload = () => ({
  subscription: {
    endpoint: 'https://push.example.com/subscription/123',
    expirationTime: null,
    keys: {
      p256dh: 'public-key',
      auth: 'auth-secret'
    }
  },
  time: '08:30',
  timezone: 'Europe/Berlin',
  favorites: [
    {
      id: 1,
      name: 'Berlin',
      country: 'DE',
      latitude: 52.52,
      longitude: 13.41
    }
  ],
  lang: 'en'
});

describe('parseId', () => {
  test('accepts a UUID', () => {
    const id = '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    expect(parseId(id)).toBe(id);
  });

  test('rejects anything else', () => {
    expect(() => parseId('../etc/passwd')).toThrow(ValidationError);
    expect(() => parseId(123)).toThrow(ValidationError);
  });
});

describe('parseSubscribePayload', () => {
  test('normalizes a valid payload', () => {
    expect(parseSubscribePayload(validPayload())).toEqual({
      ...validPayload(),
      id: undefined,
      lang: 'en'
    });
  });

  test('accepts an existing id', () => {
    const id = '3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
    expect(parseSubscribePayload({ ...validPayload(), id }).id).toBe(id);
  });

  test('defaults the language to English', () => {
    expect(parseSubscribePayload({ ...validPayload(), lang: 'de' }).lang).toBe(
      'en'
    );
  });

  test.each(['24:00', '8:00', '08:60', ''])('rejects the time %s', (time) => {
    expect(() => parseSubscribePayload({ ...validPayload(), time })).toThrow(
      'Invalid notification time'
    );
  });

  test('rejects an invalid timezone', () => {
    expect(() =>
      parseSubscribePayload({
        ...validPayload(),
        timezone: 'Mars/Olympus'
      })
    ).toThrow('Invalid timezone');
  });

  test('requires at least one favorite', () => {
    expect(() =>
      parseSubscribePayload({ ...validPayload(), favorites: [] })
    ).toThrow('At least one favorite city is required');
  });

  test('limits the number of favorites', () => {
    const favorites = Array.from({ length: 21 }, (_, index) => ({
      id: index,
      name: `City ${index}`,
      country: 'DE',
      latitude: 52.52,
      longitude: 13.41
    }));

    expect(() =>
      parseSubscribePayload({ ...validPayload(), favorites })
    ).toThrow('A maximum of 20 favorite cities is supported');
  });

  test('rejects invalid coordinates', () => {
    expect(() =>
      parseSubscribePayload({
        ...validPayload(),
        favorites: [
          {
            id: 1,
            name: 'Berlin',
            country: 'DE',
            latitude: 120,
            longitude: 13.41
          }
        ]
      })
    ).toThrow('Invalid favorite city coordinates');
  });

  test('rejects a non-HTTPS push endpoint', () => {
    const payload = validPayload();
    payload.subscription.endpoint = 'http://push.example.com/123';

    expect(() => parseSubscribePayload(payload)).toThrow(
      'Invalid push endpoint'
    );
  });

  test('rejects missing push key material', () => {
    const payload = validPayload();
    payload.subscription.keys.p256dh = '';

    expect(() => parseSubscribePayload(payload)).toThrow(
      'Invalid push subscription keys'
    );
  });

  test('rejects an invalid body', () => {
    expect(() => parseSubscribePayload(null)).toThrow('Invalid request body');
  });
});
