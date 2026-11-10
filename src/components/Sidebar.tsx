import {
  BellIcon,
  HomeIcon,
  LanguageIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { RefObject, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import { useOnClickOutside } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  borderColor,
  hoverColor,
  mutedTextColor,
  surfaceColor,
  textColor
} from '../constants/theme';
import { fetchWeatherByCityName, sidebarToggled } from '../features/app-slice';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Container = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  width: min(320px, 100%);
  height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: ${surfaceColor};
  border-right: 1px solid ${borderColor};
  box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.45);
  transition: transform 0.3s ease;
  z-index: 30;
`;

const SidebarBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.2s ease;
  z-index: 20;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${borderColor};
`;

const Heading = styled.h1`
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${textColor};
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: ${textColor};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${hoverColor};
  }
`;

const List = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
`;

const ListItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  color: ${textColor};
  font-size: 0.98rem;
  text-align: left;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${hoverColor};
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${mutedTextColor};
  }
`;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const city = useAppSelector((state) => state.app.city);
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.app.isSidebarOpen);
  const ref = useRef<HTMLElement>(null);
  const { t, i18n } = useTranslation();

  const closeSidebar = () => {
    dispatch(sidebarToggled(false));
  };

  useOnClickOutside(ref as RefObject<HTMLElement>, closeSidebar);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dispatch(sidebarToggled(false));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dispatch, isSidebarOpen]);

  const handleLanguageChange = () => {
    const language = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(language);
    localStorage.setItem('lang', language);
    document.documentElement.lang = language;
    closeSidebar();
    if (city) {
      dispatch(fetchWeatherByCityName(city.name));
    }
  };

  const goToFavorites = () => {
    navigate('/favorites');
    closeSidebar();
  };

  const goToHome = () => {
    navigate('/');
    closeSidebar();
  };

  const goToNotifications = () => {
    navigate('/notifications');
    closeSidebar();
  };

  return (
    <>
      <Container
        ref={ref}
        aria-hidden={!isSidebarOpen}
        inert={!isSidebarOpen}
        style={
          isSidebarOpen
            ? { transform: 'translateX(0)' }
            : { transform: 'translateX(-100%)' }
        }
      >
        <SidebarHeader>
          <Heading>Weathered</Heading>
          <IconButton
            type="button"
            onClick={closeSidebar}
            aria-label={t('closeMenu')}
          >
            <XMarkIcon width={22} />
          </IconButton>
        </SidebarHeader>
        <List>
          <ListItem type="button" onClick={goToHome}>
            <HomeIcon />
            {t('home')}
          </ListItem>
          <ListItem type="button" onClick={goToFavorites}>
            <StarIcon />
            {t('favorites')}
          </ListItem>
          <ListItem type="button" onClick={goToNotifications}>
            <BellIcon />
            {t('notifications')}
          </ListItem>
          <ListItem type="button" onClick={handleLanguageChange}>
            <LanguageIcon />
            {t('switch')}
          </ListItem>
        </List>
      </Container>
      {isSidebarOpen && (
        <SidebarBackdrop onClick={closeSidebar} aria-hidden="true" />
      )}
    </>
  );
};
