import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import styles from "./Main.module.css"; 
import { API_BASE_URL, POSTER_BASE_URL } from "../App";
export default function SimilarMovies() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId } = useParams();
  const [movies, setMovies] = useState([]);
  const [showMovies, setShowMovies] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [originalMovieId, setOriginalMovieId] = useState(null);
  const [userTitle, setUserTitle] = useState("Похожие фильмы");
  const [cancelLoad, setCancelLoad] = useState(false);
  const abortControllerRef = useRef(null);
  const sortedMovies = [...movies].sort((a, b) => b.rating - a.rating);
  useEffect(() => {
    setIsLoading(true);
    setNoResults(false);
    setNoResultsMessage("");
    setCancelLoad(false);
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    const processData = () => {
      if (location.state) {
        if (location.state.fromMain) {
          console.log(
            "Пользователь пришел с главной страницы, сохраняем состояние",
          );
        }
        if (location.state.similarMovies) {
          if (
            location.state.similarMovies.length === 0 &&
            location.state.noResultsMessage
          ) {
            setNoResults(true);
            setNoResultsMessage(location.state.noResultsMessage);
            setShowMovies(false);
            setIsLoading(false); 
            if (location.state.movieTitle) {
              setUserTitle(`Фильмы, похожие на "${location.state.movieTitle}"`);
            } else {
              setUserTitle(`Похожие фильмы`);
            }
            if (location.state.originalMovieId) {
              setOriginalMovieId(location.state.originalMovieId);
            } else if (movieId) {
              setOriginalMovieId(movieId);
            }
            return;
          }
          const formattedMovies = location.state.similarMovies.map((movie) => {
            let posterUrl = movie.poster_url;
            if (posterUrl && !posterUrl.startsWith("http")) {
              posterUrl = `${POSTER_BASE_URL}${posterUrl}`;
            }
            return {
              id: movie.movieId,
              title: movie.title,
              rating: movie.average_rating.toFixed(1),
              poster: posterUrl,
              year: movie.year || 2000,
              genres: movie.genres || [],
            };
          });
          setMovies(formattedMovies);
          setShowMovies(true);
          setIsLoading(false); 
          if (location.state.movieTitle) {
            setUserTitle(`Фильмы, похожие на "${location.state.movieTitle}"`);
          } else {
            setUserTitle(`Похожие фильмы`);
          }
          if (location.state.originalMovieId) {
            setOriginalMovieId(location.state.originalMovieId);
          } else if (movieId) {
            setOriginalMovieId(movieId);
          }
        } else {
          if (movieId) {
            fetchSimilarMovies(movieId);
          } else {
            setNoResults(true);
            setNoResultsMessage("Похожие фильмы не найдены");
            setShowMovies(false);
            setIsLoading(false); 
          }
        }
      } else {
        if (movieId) {
          fetchSimilarMovies(movieId);
        } else {
          setNoResults(true);
          setNoResultsMessage("Похожие фильмы не найдены");
          setShowMovies(false);
          setIsLoading(false); 
        }
      }
    };
    const timeoutId = setTimeout(() => {
      processData();
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      document.body.style.overflow = "auto";
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, movieId]);
  const fetchSimilarMovies = async (movieId) => {
    try {
      setCancelLoad(false);
      setIsLoading(true);
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
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }
      if (!response.ok || data.message) {
        console.log("Получен ответ с ошибкой:", data);
        setNoResults(true);
        setNoResultsMessage("Похожие фильмы не найдены");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const movieSignal = abortControllerRef.current.signal;
        const movieResponse = await fetch(`${API_BASE_URL}/movie/${movieId}`, { signal: movieSignal });
        if (movieResponse.ok) {
          const movieData = await movieResponse.json();
          setUserTitle(`Фильмы, похожие на "${movieData.title}"`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос информации о фильме был отменен');
          return;
        }
        console.error("Ошибка при получении данных о фильме:", error);
      }
      if (!data.recommendations || data.recommendations.length === 0) {
        setNoResults(true);
        setNoResultsMessage("Похожие фильмы не найдены");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }
      const formattedMovies = data.recommendations.map((movie) => {
        let posterUrl = movie.poster_url;
        if (posterUrl && !posterUrl.startsWith("http")) {
          posterUrl = `${POSTER_BASE_URL}${posterUrl}`;
        }
        return {
          id: movie.movieId,
          title: movie.title,
          rating: movie.average_rating.toFixed(1),
          poster: posterUrl,
          year: movie.year || 2000,
          genres: movie.genres || [],
        };
      });
      if (cancelLoad) {
        setIsLoading(false);
        return;
      }
      setMovies(formattedMovies);
      setShowMovies(true);
      setOriginalMovieId(movieId);
      setIsLoading(false);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        return;
      }
      console.error("Ошибка при получении похожих фильмов:", error);
      if (!cancelLoad) {
        setNoResults(true);
        setNoResultsMessage("Произошла ошибка при получении похожих фильмов");
        setShowMovies(false);
        setIsLoading(false);
      }
    }
  };
  const handleBackToMovie = () => {
    navigate(-2);
  };
  const handleBackToMain = () => {
    if (location.state && location.state.fromMain) {
      navigate("/main", {
        state: location.state,
        replace: true,
      });
    } else {
      navigate("/main");
    }
  };
  const handleMovieClick = (movieId) => {
    const mainPageState =
      location.state && location.state.fromMain ? location.state : null;
    navigate(`/movie/${movieId}`, {
      state: {
        ...(mainPageState || {}),
        fromSimilar: true,
        originalMovieId: originalMovieId,
      },
    });
  };
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setIsLoading(false);
    setNoResults(true);
    setNoResultsMessage("Загрузка была отменена пользователем");
    setShowMovies(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (movies.length === 0 && !location.state?.similarMovies) {
      setTimeout(() => {
        navigate(-1);
      }, 500);
    }
    setTimeout(() => {
      setCancelLoad(false);
    }, 100);
  };
  return (
    <>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <h2>Загрузка</h2>
            <div className={styles.spinner}></div>
            <button className={styles.cancelButton} onClick={handleCancelLoad}>
              Отменить
            </button>
          </div>
        </div>
      )}
      <div className={styles.container}>
        <div className={styles.similarPageHeader}>
          <div className={styles.navigationButtons}>
            <button
              className={styles.navigationButton}
              onClick={handleBackToMovie}
            >
              Вернуться назад
            </button>
            <button
              className={styles.navigationButton}
              onClick={handleBackToMain}
            >
              Вернуться на главную
            </button>
          </div>
          <h2 className={styles.similarPageTitle}>{userTitle}</h2>
        </div>
        {}
        {showMovies ? (
          <div className={styles.movieGrid}>
            {sortedMovies.map((movie, index) => (
              <div
                key={movie.id}
                className={styles.movieCard}
                onClick={() => handleMovieClick(movie.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className={styles.moviePoster}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.backgroundColor = "#2B275F";
                    e.target.style.display = "flex";
                    e.target.style.alignItems = "center";
                    e.target.style.justifyContent = "center";
                    e.target.style.color = "#EFCFFF";
                    e.target.style.fontSize = "14px";
                    e.target.style.padding = "10px";
                    e.target.style.textAlign = "center";
                  }}
                />
                <div className={styles.ratingBadge}>{movie.rating}</div>
                <div className={styles.movieInfo}>
                  <div className={styles.movieTitle}>{movie.title}</div>
                </div>
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className={styles.noResults}>
            <p>{noResultsMessage}</p>
          </div>
        ) : (
          <div className={styles.placeholder}>Загрузка похожих фильмов...</div>
        )}
      </div>
    </>
  );
}
