import { SunIcon } from '@heroicons/react/24/outline';
import { Bars3Icon, MoonIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  borderColor,
  headerBackground,
  hoverColor,
  textColor
} from '../constants/theme';
import { sidebarToggled, toggleMode } from '../features/app-slice';

const Container = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-left: env(safe-area-inset-left);
  background-color: ${headerBackground};
  border-bottom: 1px solid ${borderColor};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 10px 16px;

  @media (max-width: 480px) {
    padding: 8px 12px;
  }
`;

const Heading = styled.h1`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${textColor};
`;

const HeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: ${textColor};
  background: transparent;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;

  &:hover {
    background-color: ${hoverColor};
  }

  &:active {
    transform: scale(0.94);
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
`;

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.app.mode);
  const { t } = useTranslation();

  const toggleTheme = () => {
    dispatch(toggleMode(mode === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    dispatch(sidebarToggled(true));
  };

  return (
    <Container>
      <Inner>
        <HeadingWrapper>
          <IconButton
            type="button"
            onClick={toggleSidebar}
            aria-label={t('openMenu')}
          >
            <Bars3Icon width={22} />
          </IconButton>
          <LogoLink to="/">
            <Heading>Weathered</Heading>
          </LogoLink>
        </HeadingWrapper>
        <IconButton
          type="button"
          onClick={toggleTheme}
          aria-label={t('toggleTheme')}
          title={t('toggleTheme')}
        >
          {mode === 'light' ? <MoonIcon width={22} /> : <SunIcon width={22} />}
        </IconButton>
      </Inner>
    </Container>
  );
};
