import React, { useMemo } from 'react';
import styles from '../pages/Main.module.css';
import defaultPoster from '../assets/poster1.jpg';
const MovieCard = React.memo(({ 
  movie, 
  onClick, 
  genreTranslations = {},
  index = 0 
}) => {
  const formattedGenres = useMemo(() => {
    if (!movie.genres || movie.genres.length === 0) return 'Не указано';
    return movie.genres
      .slice(0, 2)
      .map(genre => genreTranslations[genre] || genre)
      .join(', ');
  }, [movie.genres, genreTranslations]);
  const animationDelay = useMemo(() => {
    return `${Math.min(index * 0.05, 0.5)}s`;
  }, [index]);
  const handleClick = () => {
    if (onClick) onClick(movie.id);
  };
  return (
    <div 
      className={styles.movieCard} 
      onClick={handleClick}
      style={{ animationDelay }}
    >
      <div className={styles.posterContainer}>
          src={movie.poster}
          alt={`Постер к фильму "${movie.title}"`}
          className={styles.poster}
          fallbackSrc={defaultPoster}
          loading="lazy"
        <div className={styles.rating}>{movie.rating}</div>
      </div>
      <div className={styles.movieInfo}>
        <h3 className={styles.movieTitle}>{movie.title}</h3>
        <div className={styles.movieMeta}>
          <span className={styles.year}>{movie.year}</span>
          <span className={styles.genres}>{formattedGenres}</span>
        </div>
      </div>
    </div>
  );
});
export default MovieCard;