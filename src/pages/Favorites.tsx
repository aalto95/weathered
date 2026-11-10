import { StarIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Loader } from '../components/Loader';
import { RiveAnimation } from '../components/RiveAnimation';
import SearchResults from '../components/SearchResults';
import {
  borderColor,
  cardShadow,
  mutedTextColor,
  surfaceColor,
  surfaceMutedColor,
  textColor
} from '../constants/theme';
import { fetchMultipleCities } from '../features/app-slice';

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 16px;
  align-items: stretch;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  margin: 40px auto;
  padding: 32px 24px;
  background-color: ${surfaceColor};
  border: 1px solid ${borderColor};
  border-radius: 24px;
  box-shadow: ${cardShadow};
  text-align: center;
`;

const EmptyIcon = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  background-color: ${surfaceMutedColor};
  border-radius: 50%;
  color: ${mutedTextColor};
`;

const EmptyTitle = styled.h2`
  margin: 0;
  color: ${textColor};
  font-size: 1.1rem;
  font-weight: 600;
`;

const EmptyHint = styled.p`
  margin: 0;
  max-width: 280px;
  color: ${mutedTextColor};
  font-size: 0.92rem;
  line-height: 1.5;
`;

const Centered = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 320px;
`;

const Favorites: React.FC = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.app.favorites);
  const favoritesWeather = useAppSelector(
    (state) => state.app.favoritesWeather
  );
  const isFavoritesFetching = useAppSelector(
    (state) => state.app.isFavoritesFetching
  );
  const favoritesFetchError = useAppSelector(
    (state) => state.app.favoritesFetchError
  );

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchMultipleCities(favorites));
  }, [dispatch, favorites]);

  if (!favorites.length) {
    return (
      <Page>
        <PageHeader>
          <Title>{t('favorites')}</Title>
        </PageHeader>
        <EmptyState>
          <EmptyIcon>
            <StarIcon width={24} />
          </EmptyIcon>
          <EmptyTitle>{t('noFavorites')}</EmptyTitle>
          <EmptyHint>{t('noFavoritesHint')}</EmptyHint>
        </EmptyState>
      </Page>
    );
  }

  if (favoritesFetchError) {
    return (
      <Page>
        <PageHeader>
          <Title>{t('favorites')}</Title>
        </PageHeader>
        <Centered>
          <RiveAnimation animationName="404" width={240} height={240} />
        </Centered>
      </Page>
    );
  }

  if (isFavoritesFetching && !favoritesWeather.length) {
    return (
      <Page>
        <PageHeader>
          <Title>{t('favorites')}</Title>
        </PageHeader>
        <Centered>
          <Loader width={240} height={240} />
        </Centered>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <Title>{t('favorites')}</Title>
      </PageHeader>
      <Grid>
        {favoritesWeather.map((city) => (
          <SearchResults
            key={city.id}
            city={city}
            fetchError={false}
            isFetching={false}
            showForecast={false}
          />
        ))}
      </Grid>
    </Page>
  );
};

export default Favorites;
