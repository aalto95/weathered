import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import theme from 'styled-theming';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Loader } from '../components/Loader';
import { RiveAnimation } from '../components/RiveAnimation';
import SearchResults from '../components/SearchResults';
import { fetchMultipleCities } from '../features/app-slice';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 16px 0;
`;

const noFavoritesColor = theme('mode', {
  light: '#1C1E21',
  dark: '#E3E3E3'
});

const NoFavoritesText = styled.h1`
  color: ${noFavoritesColor};
  padding: 1rem;
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
      <Container>
        <NoFavoritesText>{t('noFavorites')}</NoFavoritesText>
      </Container>
    );
  }

  if (favoritesFetchError) {
    return (
      <Container>
        <RiveAnimation animationName="404" />
      </Container>
    );
  }

  if (isFavoritesFetching && !favoritesWeather.length) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  return (
    <Container>
      {favoritesWeather.map((city) => (
        <SearchResults
          key={city.id}
          city={city}
          fetchError={false}
          isFetching={false}
        />
      ))}
    </Container>
  );
};

export default Favorites;
