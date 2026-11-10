import theme from 'styled-theming';

export const textColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3'
});

export const mutedTextColor = theme('mode', {
  light: '#5F6673',
  dark: '#A3AAB5'
});

export const surfaceColor = theme('mode', {
  light: '#FFFFFF',
  dark: '#242526'
});

export const surfaceMutedColor = theme('mode', {
  light: '#F2F4F7',
  dark: '#2E3134'
});

export const headerBackground = theme('mode', {
  light: 'rgba(250, 250, 250, 0.8)',
  dark: 'rgba(27, 27, 29, 0.8)'
});

export const pageBackground = theme('mode', {
  light:
    'radial-gradient(circle at 50% -20%, #DBEAFE 0%, rgba(219, 234, 254, 0) 55%), #FAFAFA',
  dark: 'radial-gradient(circle at 50% -20%, #1E293B 0%, rgba(30, 41, 59, 0) 55%), #1B1B1D'
});

export const borderColor = theme('mode', {
  light: 'rgba(28, 30, 33, 0.1)',
  dark: 'rgba(255, 255, 255, 0.12)'
});

export const accentColor = theme('mode', {
  light: '#2563EB',
  dark: '#60A5FA'
});

export const hoverColor = theme('mode', {
  light: 'rgba(28, 30, 33, 0.06)',
  dark: 'rgba(255, 255, 255, 0.08)'
});

export const focusRingColor = theme('mode', {
  light: 'rgba(37, 99, 235, 0.18)',
  dark: 'rgba(96, 165, 250, 0.24)'
});

export const cardShadow = theme('mode', {
  light: '0 24px 48px -28px rgba(15, 23, 42, 0.45)',
  dark: '0 24px 48px -28px rgba(0, 0, 0, 0.9)'
});
