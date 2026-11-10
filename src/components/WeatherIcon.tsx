import React from 'react';
import { WeatherAnimation } from '../models/weather.model';

interface WeatherIconProps {
  condition: WeatherAnimation;
  size?: number;
}

const cloud = (
  <path d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
);

const icons: Record<WeatherAnimation, React.ReactNode> = {
  clear: (
    <>
      <circle cx="12" cy="12" r="3.75" />
      <path d="M12 2.5v2.25M12 19.25v2.25M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.5 12h2.25M19.25 12h2.25M4.4 19.6l1.6-1.6M18 6l1.6-1.6" />
    </>
  ),
  clouds: cloud,
  rain: (
    <>
      {cloud}
      <path d="M8 20.5 7.25 22M12 20.5 11.25 22M16 20.5 15.25 22" />
    </>
  ),
  snow: (
    <>
      {cloud}
      <path d="M8 21.5h.01M12 21.5h.01M16 21.5h.01" strokeWidth={2.5} />
    </>
  ),
  thunderstorm: (
    <>
      {cloud}
      <path d="m13 18-2 3.5h2.5L12.5 24" />
    </>
  )
};

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 24
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {icons[condition]}
  </svg>
);
