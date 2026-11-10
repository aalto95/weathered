import { BellIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import styled from 'styled-components';
import { useAppSelector } from '../app/hooks';
import {
  accentColor,
  borderColor,
  cardShadow,
  mutedTextColor,
  surfaceColor,
  surfaceMutedColor,
  textColor
} from '../constants/theme';
import { usePushNotifications } from '../hooks/usePushNotifications';

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const PageHeader = styled.header`
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  color: ${textColor};
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  max-width: 480px;
  margin: 8px auto 0;
  color: ${mutedTextColor};
  font-size: 0.92rem;
  line-height: 1.5;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 620px;
  padding: clamp(20px, 4vw, 28px);
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 24px;
  box-shadow: ${cardShadow};
  color: ${textColor};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.span`
  color: ${mutedTextColor};
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const TimeRow = styled.div`
  display: grid;
  grid-template-columns: minmax(130px, 180px) 1fr;
  gap: 14px;
  align-items: end;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  background-color: ${surfaceMutedColor};
  border: 1px solid ${borderColor};
  border-radius: 12px;
  color: ${textColor};
  font-family: inherit;
  font-size: 1rem;
  font-variant-numeric: tabular-nums;

  &:focus-visible {
    outline: 2px solid ${accentColor};
    outline-offset: 1px;
  }
`;

const Timezone = styled.div`
  padding: 12px 14px;
  background-color: ${surfaceMutedColor};
  border: 1px solid transparent;
  border-radius: 12px;
  color: ${textColor};
  font-size: 0.95rem;
`;

const CityList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CityChip = styled.span`
  padding: 7px 11px;
  background-color: ${surfaceMutedColor};
  border: 1px solid ${borderColor};
  border-radius: 999px;
  color: ${textColor};
  font-size: 0.85rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Button = styled.button`
  padding: 11px 16px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${accentColor};
  color: #fff;
`;

const SecondaryButton = styled(Button)`
  background-color: ${surfaceMutedColor};
  color: ${textColor};
  border: 1px solid ${borderColor};
`;

const DangerButton = styled(Button)`
  background-color: transparent;
  color: #dc2626;
  border: 1px solid currentColor;
`;

const Notice = styled.p`
  margin: 0;
  padding: 12px 14px;
  background-color: ${surfaceMutedColor};
  border-radius: 12px;
  color: ${mutedTextColor};
  font-size: 0.88rem;
  line-height: 1.5;
`;

const ErrorNotice = styled(Notice)`
  color: #dc2626;
`;

const SuccessNotice = styled(Notice)`
  color: #16a34a;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${textColor};
  font-size: 0.92rem;
  font-weight: 500;
`;

const StatusDot = styled.span<{ $active: boolean }>`
  width: 9px;
  height: 9px;
  background-color: ${({ $active }) => ($active ? '#16a34a' : '#9ca3af')};
  border-radius: 50%;
`;

const EmptyIcon = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 0 auto;
  background-color: ${surfaceMutedColor};
  border-radius: 50%;
  color: ${mutedTextColor};
`;

const EmptyTitle = styled.h2`
  margin: 12px 0 4px;
  color: ${textColor};
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
`;

const EmptyHint = styled.p`
  max-width: 320px;
  margin: 0 auto 16px;
  color: ${mutedTextColor};
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  padding: 10px 16px;
  background-color: ${accentColor};
  border-radius: 999px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
`;

const Notifications: React.FC = () => {
  const favorites = useAppSelector((state) => state.app.favorites);
  const { t, i18n } = useTranslation();
  const language = i18n.language === 'ru' ? 'ru' : 'en';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const {
    supported,
    blockedReason,
    subscribed,
    busy,
    error,
    settings,
    enable,
    disable,
    test
  } = usePushNotifications();

  const [time, setTime] = useState(settings?.time ?? '08:00');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.time) {
      setTime(settings.time);
    }
  }, [settings?.time]);

  const blockedMessage = (() => {
    switch (blockedReason) {
      case 'missing-config':
        return t('notificationsMissingConfig');
      case 'ios-install':
        return t('notificationsIosInstall');
      case 'denied':
        return t('notificationsDenied');
      case 'unsupported':
        return t('notificationsUnsupported');
      default:
        return null;
    }
  })();

  const canEnable = supported && !blockedReason && favorites.length > 0;

  const save = async () => {
    setMessage(null);
    try {
      await enable(time, timezone, favorites, language);
      setMessage(t('notificationSaved'));
    } catch {
      // The hook exposes the error message below.
    }
  };

  const sendTest = async () => {
    setMessage(null);
    try {
      await test();
      setMessage(t('notificationTestSent'));
    } catch {
      // The hook exposes the error message below.
    }
  };

  const turnOff = async () => {
    setMessage(null);
    try {
      await disable();
      setMessage(t('notificationDisabled'));
    } catch {
      // The hook exposes the error message below.
    }
  };

  if (favorites.length === 0) {
    return (
      <Page>
        <PageHeader>
          <Title>{t('notifications')}</Title>
        </PageHeader>
        <Card>
          <div>
            <EmptyIcon>
              <BellIcon width={24} />
            </EmptyIcon>
            <EmptyTitle>{t('notificationsEmptyTitle')}</EmptyTitle>
            <EmptyHint>{t('notificationsEmpty')}</EmptyHint>
            <div style={{ textAlign: 'center' }}>
              <HomeLink to="/">{t('home')}</HomeLink>
            </div>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <Title>{t('notifications')}</Title>
        <Subtitle>{t('notificationsIntro')}</Subtitle>
      </PageHeader>
      <Card>
        <Status>
          <StatusDot $active={subscribed} />
          {subscribed
            ? `${t('notificationEnabled')} · ${t('notificationDailyAt')} ${
                settings?.time ?? time
              }`
            : t('notificationDisabled')}
        </Status>

        {blockedMessage && <Notice>{blockedMessage}</Notice>}

        <TimeRow>
          <Field>
            <Label>{t('notificationTime')}</Label>
            <TimeInput
              id="notification-time"
              type="time"
              aria-label={t('notificationTime')}
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </Field>
          <Field>
            <Label>{t('notificationTimezone')}</Label>
            <Timezone>{timezone}</Timezone>
          </Field>
        </TimeRow>

        <Field>
          <Label>{t('notificationCities')}</Label>
          <CityList>
            {favorites.map((favorite) => (
              <CityChip key={favorite.id}>{favorite.name}</CityChip>
            ))}
          </CityList>
        </Field>

        {error && <ErrorNotice>{error}</ErrorNotice>}
        {message && <SuccessNotice>{message}</SuccessNotice>}

        <ButtonRow>
          {subscribed ? (
            <>
              <PrimaryButton
                type="button"
                onClick={save}
                disabled={busy || !canEnable}
              >
                {t('saveNotificationTime')}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={sendTest} disabled={busy}>
                {t('sendTestNotification')}
              </SecondaryButton>
              <DangerButton type="button" onClick={turnOff} disabled={busy}>
                {t('disableNotifications')}
              </DangerButton>
            </>
          ) : (
            <PrimaryButton
              type="button"
              onClick={save}
              disabled={busy || !canEnable}
            >
              {busy ? t('saving') : t('enableNotifications')}
            </PrimaryButton>
          )}
        </ButtonRow>
      </Card>
    </Page>
  );
};

export default Notifications;
