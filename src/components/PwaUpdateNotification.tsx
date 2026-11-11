import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  accentColor,
  borderColor,
  cardShadow,
  hoverColor,
  mutedTextColor,
  surfaceColor,
  textColor
} from '../constants/theme';

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  position: fixed;
  right: 0;
  bottom: calc(84px + env(safe-area-inset-bottom));
  left: 0;
  z-index: 45;
  display: flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: calc(100% - 24px);
  margin: 0 auto;
  padding: 10px 10px 10px 16px;
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 16px;
  box-shadow: ${cardShadow};
  color: ${textColor};
  animation: ${slideIn} 0.25s ease;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const Message = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${mutedTextColor};
`;

const UpdateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background-color: ${accentColor};
  border-radius: 999px;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LaterButton = styled.button`
  padding: 9px 12px;
  border-radius: 999px;
  color: ${mutedTextColor};
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${hoverColor};
  }
`;

export const PwaUpdateNotification: React.FC = () => {
  const { t } = useTranslation();
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW: (_swUrl, registration) => {
      registrationRef.current = registration ?? null;
    }
  });

  useEffect(() => {
    const checkForUpdate = () => {
      registrationRef.current?.update().catch(() => undefined);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  if (!needRefresh) {
    return null;
  }

  const update = () => {
    updateServiceWorker(true).catch(() => undefined);
  };

  return (
    <Container role="status" aria-live="polite">
      <Message>{t('updateAvailable')}</Message>
      <UpdateButton type="button" onClick={update}>
        <ArrowPathIcon />
        {t('updateApp')}
      </UpdateButton>
      <LaterButton type="button" onClick={() => setNeedRefresh(false)}>
        {t('updateLater')}
      </LaterButton>
    </Container>
  );
};
