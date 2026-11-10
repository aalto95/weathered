import { XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useTimeout } from 'usehooks-ts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  accentColor,
  borderColor,
  cardShadow,
  hoverColor,
  surfaceColor,
  textColor
} from '../constants/theme';
import {
  dismissA2HSButton,
  isA2HSButtonDismissedSet
} from '../features/app-slice';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Container = styled.div`
  position: fixed;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: calc(100% - 32px);
  margin: 0 auto;
  padding: 8px;
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 16px;
  box-shadow: ${cardShadow};
  color: ${textColor};
  transition: transform 0.4s ease;
`;

const InstallButton = styled.button`
  padding: 10px 16px;
  background-color: ${accentColor};
  border-radius: 999px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const DismissButton = styled.button`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: ${textColor};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${hoverColor};
  }
`;

export const AddToHomeScreenNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const isA2HSButtonDismissed = useAppSelector(
    (state) => state.app.isA2HSButtonDismissed
  );
  const { t } = useTranslation();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  useTimeout(show, 1000);

  useEffect(() => {
    dispatch(
      isA2HSButtonDismissedSet(
        localStorage.getItem('a2hsButtonDismissed') === 'true'
      )
    );

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () =>
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, [dispatch]);

  const install = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => dispatch(dismissA2HSButton()), 400);
  };

  if (isA2HSButtonDismissed || !installPrompt) {
    return null;
  }

  return (
    <Container
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(120px)'
      }}
    >
      <InstallButton type="button" onClick={install}>
        {t('install')}
      </InstallButton>
      <DismissButton type="button" onClick={dismiss} aria-label={t('dismiss')}>
        <XMarkIcon width={18} />
      </DismissButton>
    </Container>
  );
};
