import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./MovieDetails.module.css";
import mask from "../assets/mask.svg";
import backButton from "../assets/back-button.svg";
import { API_BASE_URL, POSTER_BASE_URL } from "../App";
export default function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterError, setPosterError] = useState(false);
  const [cancelLoad, setCancelLoad] = useState(false);
  const [error, setError] = useState(false);
  const abortControllerRef = useRef(null);
  const initialRenderRef = useRef(true);
  useEffect(() => {
    setLoading(true);
    setMovie(null);
    setError(false);
    setCancelLoad(false);
    initialRenderRef.current = false;
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.has("reset")) {
      const timestamp = new Date().getTime();
      navigate(`/main?reset=${timestamp}`, { replace: true, state: null });
      return;
    }
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    const fetchMovieDetails = async () => {
      try {
        setCancelLoad(false);
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, { signal });
        if (cancelLoad) {
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Не удалось получить данные о фильме");
        }
        const data = await response.json();
        if (cancelLoad) {
          setLoading(false);
          return;
        }
        if (data.poster_url && !data.poster_url.startsWith("http")) {
          data.poster_url = `${POSTER_BASE_URL}${data.poster_url}`;
        }
        setMovie(data);
        setError(false);
        setLoading(false);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос был отменен');
          setLoading(false);
          return;
        }
        console.error("Ошибка при получении данных о фильме:", error);
        setError(true);
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchMovieDetails();
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = "auto";
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [movieId, navigate, location.search]);
  const fetchSimilarMovies = async () => {
    try {
      setCancelLoad(false);
      setLoading(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await fetch(
        `${API_BASE_URL}/recommend/similar-movies/${movieId}`,
        { signal }
      );
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      if (!response.ok || data.message) {
        console.log("Получен ответ с ошибкой:", data);
        if (cancelLoad) {
          setLoading(false);
          return;
        }
        const stateToPass = {
          ...location.state,
          similarMovies: [],
          movieTitle: movie?.title || "Фильм",
          originalMovieId: movieId,
          fromMovieDetails: true,
          noResultsMessage: "Похожие фильмы не найдены",
        };
        if (location.state && location.state.fromMain) {
          stateToPass.fromMain = true;
        }
        setLoading(false);
        navigate(`/similar/${movieId}`, { state: stateToPass });
        return;
      }
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      const stateToPass = {
        ...location.state,
        similarMovies: data.recommendations,
        movieTitle: movie?.title || "Фильм",
        originalMovieId: movieId,
        fromMovieDetails: true,
      };
      if (location.state && location.state.fromMain) {
        stateToPass.fromMain = true;
      }
      setLoading(false);
      navigate(`/similar/${movieId}`, { state: stateToPass });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        setLoading(false);
        return;
      }
      console.error("Ошибка при получении похожих фильмов:", error);
      if (cancelLoad) {
        setLoading(false);
        return;
      }
      const stateToPass = {
        ...location.state,
        similarMovies: [],
        movieTitle: movie?.title || "Фильм",
        originalMovieId: movieId,
        fromMovieDetails: true,
        noResultsMessage: "Похожие фильмы не найдены.",
      };
      if (location.state && location.state.fromMain) {
        stateToPass.fromMain = true;
      }
      setLoading(false);
      navigate(`/similar/${movieId}`, { state: stateToPass });
    }
  };
  const handleSimilarMovies = () => {
    setCancelLoad(false);
    fetchSimilarMovies();
  };
  const handleBack = (e) => {
    e.preventDefault();
    if (location.state && location.state.fromSimilar) {
      navigate(-1);
    } else if (location.state && location.state.fromMain) {
      navigate("/main", {
        state: location.state,
        replace: true,
      });
    } else {
      navigate(-1);
    }
  };
  const handlePosterError = () => {
    setPosterError(true);
  };
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (!movie) {
      navigate(-1);
    }
    setTimeout(() => {
      setCancelLoad(false);
    }, 100);
  };
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <div className={styles.starRating}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={styles.starFull}>
            ★
          </span>
        ))}
        {hasHalfStar && <span className={styles.starHalf}>★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={styles.starEmpty}>
            ★
          </span>
        ))}
      </div>
    );
  };
  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingContent}>
          <h2>Загрузка</h2>
          <div className={styles.spinner}></div>
          <button className={styles.cancelButton} onClick={handleCancelLoad}>
            Отменить
          </button>
        </div>
      </div>
    );
  }
  if (error || (!movie && !loading)) {
    return <div className={styles.error}>Фильм не найден</div>;
  }
  if (!movie) {
    return null;
  }
  const posterUrl = posterError ? null : movie.poster_url || movie.poster_ur;
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.posterContainer}>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className={styles.poster}
              onError={handlePosterError}
            />
          ) : (
            <div className={styles.emptyPoster}>
              <span>{movie.title}</span>
            </div>
          )}
        </div>
        <div className={styles.detailsCard}>
          <div className={styles.titleAndBackButtonContainer}>
            <h1 className={styles.title}>{movie.title}</h1>
            <button onClick={handleBack} className={styles.backButton}>
              <img
                src={backButton}
                alt="Back"
                className={styles.backButtonIcon}
              />
            </button>
          </div>
          {renderStarRating(movie.average_rating)}
          <div className={styles.genreContainer}>
            <img src={mask} alt="Mask" className={styles.genreIcon} />
            <span className={styles.genreLabel}>
              {movie.genres.join(" | ")}
            </span>
          </div>
          <div className={styles.overview}>
            <p>{movie.overview}</p>
          </div>
          <div className={styles.footer}>
            <div className={styles.year}>
              <span className={styles.yearLabel}>Год:</span> {movie.year}
            </div>
            <button
              className={styles.similarButton}
              onClick={handleSimilarMovies}
            >
              Похожие фильмы
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
