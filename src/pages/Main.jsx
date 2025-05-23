import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import searchIcon from "../assets/search.svg";
import genreIcon from "../assets/genre.svg";
import rateIcon from "../assets/rate.svg";
import yearIcon from "../assets/year.svg";
import clearIcon from "../assets/clear.svg";
import filterIcon from "../assets/filter.svg";
import styles from "./Main.module.css";
import filterStyles from "../components/FilterModal.module.css";
import tape from "../assets/tape.png";
import { theme } from "../styles/theme";
import FiltersModal from "../components/FiltersModal";
import YearSlider from "../components/YearSlider";
import { API_BASE_URL, POSTER_BASE_URL } from "../App";
import poster1 from "../assets/poster1.jpg";
import poster2 from "../assets/poster2.jpg";
import poster3 from "../assets/poster3.jpg";
import poster4 from "../assets/poster4.jpg";
import poster5 from "../assets/poster5.jpg";
const posters = [poster1, poster2, poster3, poster4, poster5];
const defaultPoster = poster1; 
const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Children",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Film-Noir",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-fi",
  "Thriller",
  "War",
  "Western",
];
const ratingOptions = ["1+", "2+", "3+", "4+", "5"];
const GENRE_TRANSLATIONS = {
  Action: "Боевик",
  Adventure: "Приключения",
  Animation: "Анимация",
  Children: "Детский",
  Comedy: "Комедия",
  Crime: "Криминал",
  Documentary: "Документальный",
  Drama: "Драма",
  Fantasy: "Фэнтези",
  "Film-Noir": "Фильм-нуар",
  Horror: "Ужасы",
  Musical: "Мюзикл",
  Mystery: "Детектив",
  Romance: "Мелодрама",
  "Sci-fi": "Научная фантастика",
  Thriller: "Триллер",
  War: "Военный",
  Western: "Вестерн",
  "(no genres listed)": "Не указано",
};
export default function Main() {
  const navigate = useNavigate();
  const location = useLocation();
  const { movieId } = useParams();
  const [activeTab, setActiveTab] = useState("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [userTitle, setUserTitle] = useState("Рекомендации для пользователя");
  const [movies, setMovies] = useState([]);
  const [showMovies, setShowMovies] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filtersDisabled, setFiltersDisabled] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [bestFirst, setBestFirst] = useState(true);
  const [yearRange, setYearRange] = useState({ minYear: 1874, maxYear: 2016 });
  const [genreFilterActive, setGenreFilterActive] = useState(false);
  const [ratingFilterActive, setRatingFilterActive] = useState(false);
  const [yearFilterActive, setYearFilterActive] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [cancelLoad, setCancelLoad] = useState(false);
  const abortControllerRef = useRef(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isReset = urlParams.has("reset");
    if (!location.state || !location.state.movies || location.state.movies.length === 0) {
      setIsLoading(false);
    }
    if (isReset) {
      setActiveTab("personal");
      setSearchQuery("");
      setUserId("");
      setUserIdInput("");
      setUserTitle("Рекомендации для пользователя");
      setMovies([]);
      setShowMovies(false);
      setNoResults(false);
      setNoResultsMessage("");
      setFiltersDisabled(true); 
      setIsLoading(false); 
      setShowFiltersModal(false);
      setSelectedGenres([]);
      setSelectedRatings([]);
      setBestFirst(true);
      setYearRange({ minYear: 1874, maxYear: 2016 });
      setGenreFilterActive(false);
      setRatingFilterActive(false);
      setYearFilterActive(false);
      window.scrollTo(0, 0);
      navigate("/main", { replace: true });
      return;
    }
    if (location.state) {
      if (location.state.scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, location.state.scrollPosition);
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
      if (location.state.searchQuery) {
        setSearchQuery(location.state.searchQuery);
        if (location.state.searchQuery.trim() !== "") {
          setUserTitle(
            `Результаты поиска по запросу "${location.state.searchQuery}"`,
          );
          setFiltersDisabled(true);
        } else if (location.state.userIdInput && location.state.userIdInput.trim() !== "") {
          setFiltersDisabled(false);
        } else {
          setFiltersDisabled(true);
        }
      }
      if (location.state.userIdInput) {
        setUserIdInput(location.state.userIdInput);
        setUserId(location.state.userIdInput);
        if (!location.state.searchQuery || location.state.searchQuery.trim() === "") {
          setFiltersDisabled(false);
        }
      }
      if (location.state.userTitle) {
        setUserTitle(location.state.userTitle);
      }
      if (location.state.selectedGenres) {
        setSelectedGenres(location.state.selectedGenres);
      }
      if (location.state.selectedRatings) {
        setSelectedRatings(location.state.selectedRatings);
      }
      if (location.state.bestFirst !== undefined) {
        setBestFirst(location.state.bestFirst);
      }
      if (location.state.yearRange) {
        console.log(
          "Восстанавливаем диапазон лет из state:",
          location.state.yearRange,
        );
        setYearRange({
          minYear: location.state.yearRange.minYear,
          maxYear: location.state.yearRange.maxYear,
        });
      }
      if (location.state.genreFilterActive !== undefined) {
        setGenreFilterActive(location.state.genreFilterActive);
      }
      if (location.state.ratingFilterActive !== undefined) {
        setRatingFilterActive(location.state.ratingFilterActive);
      }
      if (location.state.yearFilterActive !== undefined) {
        setYearFilterActive(location.state.yearFilterActive);
      }
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
      }
      if (location.state.movies && location.state.movies.length > 0) {
        setMovies(location.state.movies);
        setShowMovies(true);
        setIsLoading(false); 
      }
      if (location.state.filtersDisabled !== undefined) {
        setFiltersDisabled(location.state.filtersDisabled);
      }
    } else {
      window.scrollTo(0, 0);
      setActiveTab("personal");
      setSearchQuery("");
      setUserId("");
      setUserIdInput("");
      setUserTitle("Рекомендации для пользователя");
      setMovies([]);
      setShowMovies(false);
      setNoResults(false);
      setNoResultsMessage("");
      setFiltersDisabled(true); 
      setIsLoading(false); 
      setShowFiltersModal(false);
      setSelectedGenres([]);
      setSelectedRatings([]);
      setBestFirst(true);
      setYearRange({ minYear: 1874, maxYear: 2016 });
      setGenreFilterActive(false);
      setRatingFilterActive(false);
      setYearFilterActive(false);
    }
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "auto";
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [location, location.search, navigate]);
  const getRandomGenres = () => {
    const numberOfGenres = Math.floor(Math.random() * 4) + 1;
    const shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfGenres);
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (userIdInput) {
      setUserId(userIdInput);
      if (tab === "popular") {
        setIsLoading(true);
        if (genreFilterActive || ratingFilterActive || yearFilterActive) {
          setTimeout(() => {
            applyFilters(tab);
          }, 100);
        } else {
          fetchSimilarUsersRecommendations(userIdInput);
        }
      } else {
        setIsLoading(true);
        if (genreFilterActive || ratingFilterActive || yearFilterActive) {
          setTimeout(() => {
            applyFilters(tab);
          }, 100);
        } else {
          fetchPersonalRecommendations(userIdInput);
        }
      }
    }
  };
  const fetchSimilarUsersRecommendations = async (userId) => {
    try {
      setCancelLoad(false);
      setUserTitle(`Популярно у пользователей с похожим вкусом`);
      setNoResults(false);
      setNoResultsMessage("");
      setIsLoading(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await fetch(
        `${API_BASE_URL}/recommend/by-similar-ones/${userId}`,
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
        setNoResultsMessage("Для этого пользователя нет рекомендаций.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      console.log("Ответ API для рекомендаций по похожим пользователям:", data);
      let moviesList = [];
      if (Array.isArray(data)) {
        moviesList = data;
      } else if (
        data &&
        data.recommendations &&
        Array.isArray(data.recommendations)
      ) {
        moviesList = data.recommendations;
      } else {
        throw new Error("Неверный формат ответа от API");
      }
      if (moviesList.length === 0) {
        setNoResults(true);
        setNoResultsMessage("Для этого пользователя нет рекомендаций.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      if (cancelLoad) {
        setIsLoading(false); 
        return;
      }
      const formattedMovies = moviesList.map((movie) => {
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
      setFiltersDisabled(false);
      setSearchQuery("");
      setShowMovies(true);
      setIsLoading(false); 
      if (genreFilterActive || ratingFilterActive || yearFilterActive) {
        setTimeout(() => {
          if (!cancelLoad) {
            applyFilters();
          }
        }, 200);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        setIsLoading(false); 
        return;
      }
      console.error("Ошибка при получении рекомендаций:", error);
      if (!cancelLoad) {
        setNoResults(true);
        setNoResultsMessage(
          "Произошла ошибка при получении рекомендаций. Пожалуйста, проверьте ID пользователя и попробуйте снова."
        );
        setShowMovies(false);
        setIsLoading(false);
      }
    }
  };
  const fetchPersonalRecommendations = async (userId) => {
    try {
      setCancelLoad(false);
      setUserTitle(`Рекомендации для пользователя`);
      setNoResults(false);
      setNoResultsMessage("");
      setIsLoading(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await fetch(
        `${API_BASE_URL}/recommend/by-ratings/${userId}`,
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
        setNoResultsMessage("Для этого пользователя нет рекомендаций.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      console.log("Ответ API для персональных рекомендаций:", data);
      let moviesList = [];
      if (Array.isArray(data)) {
        moviesList = data;
      } else if (
        data &&
        data.recommendations &&
        Array.isArray(data.recommendations)
      ) {
        moviesList = data.recommendations;
      } else {
        throw new Error("Неверный формат ответа от API");
      }
      if (moviesList.length === 0) {
        setNoResults(true);
        setNoResultsMessage("Для этого пользователя нет рекомендаций.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      if (cancelLoad) {
        setIsLoading(false); 
        return;
      }
      const formattedMovies = moviesList.map((movie) => {
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
      setFiltersDisabled(false);
      setSearchQuery("");
      setShowMovies(true);
      setIsLoading(false); 
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        setIsLoading(false); 
        return;
      }
      console.error("Ошибка при получении рекомендаций:", error);
      if (!cancelLoad) {
        setNoResults(true);
        setNoResultsMessage(
          "Произошла ошибка при получении рекомендаций. Пожалуйста, проверьте ID пользователя и попробуйте снова."
        );
        setShowMovies(false);
        setIsLoading(false);
      }
    }
  };
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (searchQuery.trim() === "") return;
      setIsLoading(true);
      setCancelLoad(false);
      setNoResults(false);
      setNoResultsMessage("");
      setUserIdInput("");
      setUserId("");
      setFiltersDisabled(true);
      setSelectedGenres([]);
      setSelectedRatings([]);
      setYearRange({ minYear: 1874, maxYear: 2016 });
      setBestFirst(true);
      setGenreFilterActive(false);
      setRatingFilterActive(false);
      setYearFilterActive(false);
      try {
        setUserTitle(`Результаты поиска по запросу "${searchQuery}"`);
        const fetchMovies = async () => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          abortControllerRef.current = new AbortController();
          const signal = abortControllerRef.current.signal;
          const response = await fetch(
            `${API_BASE_URL}/movies/search?query=${encodeURIComponent(searchQuery)}`,
            { signal }
          );
          if (cancelLoad) {
            setIsLoading(false); 
            return;
          }
          if (!response.ok) {
            throw new Error("Не удалось выполнить поиск фильмов");
          }
          const data = await response.json();
          if (cancelLoad) {
            setIsLoading(false); 
            return;
          }
          console.log("Ответ API для поиска фильмов:", data);
          let moviesList = [];
          if (Array.isArray(data)) {
            moviesList = data;
          } else if (data && data.results && Array.isArray(data.results)) {
            moviesList = data.results;
          } else {
            throw new Error("Неверный формат ответа от API");
          }
          if (moviesList.length === 0) {
            setNoResults(true);
            setNoResultsMessage(
              `По запросу "${searchQuery}" ничего не найдено.`
            );
            setShowMovies(false);
            setIsLoading(false);
            return;
          }
          if (cancelLoad) {
            setIsLoading(false); 
            return;
          }
          const formattedMovies = moviesList.map((movie) => {
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
          console.log("Отформатированные фильмы:", formattedMovies);
          setMovies(formattedMovies);
          setShowMovies(true);
          setIsLoading(false); 
        };
        setTimeout(() => {
          fetchMovies();
        }, 100);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Запрос был отменен');
          setIsLoading(false); 
          return;
        }
        console.error("Ошибка при поиске фильмов:", error);
        if (!cancelLoad) {
          setNoResults(true);
          setNoResultsMessage(
            "Произошла ошибка при поиске фильмов. Пожалуйста, попробуйте еще раз."
          );
          setShowMovies(false);
          setIsLoading(false);
        }
      }
    }
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    setUserTitle("Рекомендации для пользователя");
    setFiltersDisabled(userIdInput.trim() === "");
    setShowMovies(false);
    setSelectedGenres([]);
    setSelectedRatings([]);
    setYearRange({ minYear: 1874, maxYear: 2016 });
    setBestFirst(true);
    setGenreFilterActive(false);
    setRatingFilterActive(false);
    setYearFilterActive(false);
  };
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() !== "") {
      setFiltersDisabled(true);
    } else {
      setFiltersDisabled(userIdInput.trim() === "");
    }
  };
  const handleUserIdChange = (e) => {
    const value = e.target.value;
    setUserIdInput(value);
    setFiltersDisabled(value.trim() === "");
  };
  const handleUserIdSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        setUserId(userIdInput);
        setIsLoading(true);
        const currentTab = activeTab;
        if (currentTab === "popular") {
          fetchSimilarUsersRecommendations(userIdInput);
        } else {
          fetchPersonalRecommendations(userIdInput);
        }
      } catch (error) {
        console.error("Ошибка при получении рекомендаций:", error);
        setIsLoading(false);
      }
    }
  };
  const handleMovieClick = (movieId) => {
    const currentState = {
      fromMain: true,
      scrollPosition,
      searchQuery,
      userIdInput,
      userId,
      userTitle,
      selectedGenres,
      selectedRatings,
      bestFirst,
      yearRange: {
        minYear: yearRange.minYear,
        maxYear: yearRange.maxYear,
      },
      genreFilterActive,
      ratingFilterActive,
      yearFilterActive,
      movies,
      showMovies,
      activeTab,
      filtersDisabled,
    };
    console.log(
      "Сохраняем состояние при переходе на расширенную карточку фильма:",
      currentState,
    );
    navigate(`/movie/${movieId}`, { state: currentState });
  };
  const applyAllFilters = (filters) => {
    const {
      selectedGenres: newGenres,
      selectedRatings: newRatings,
      yearRange: newYearRange,
      bestFirst: newBestFirst,
    } = filters;
    console.log("Применяем фильтры:", filters);
    const areFiltersEmpty =
      newGenres.length === 0 &&
      newRatings.length === 0 &&
      newYearRange.minYear === 1874 &&
      newYearRange.maxYear === 2016;
    setSelectedGenres(newGenres);
    setGenreFilterActive(newGenres.length > 0);
    setSelectedRatings(newRatings);
    setRatingFilterActive(newRatings.length > 0);
    setYearRange(newYearRange);
    setYearFilterActive(
      newYearRange.minYear !== 1874 || newYearRange.maxYear !== 2016,
    );
    setBestFirst(newBestFirst);
    const currentTab = activeTab;
    if (userIdInput) {
      if (areFiltersEmpty) {
        console.log(
          "Все фильтры пустые, получаем нефильтрованные рекомендации",
        );
        if (currentTab === "popular") {
          fetchSimilarUsersRecommendations(userIdInput);
        } else {
          fetchPersonalRecommendations(userIdInput);
        }
      } else {
        console.log("Применяем фильтры к API");
        const params = new URLSearchParams();
        if (newGenres.length > 0) {
          newGenres.forEach((genre) => {
            params.append("genres", GENRE_TRANSLATIONS[genre] || genre);
          });
        }
        if (newRatings.length > 0) {
          const minRating = parseInt(newRatings[0].charAt(0));
          params.append("min_rating", minRating);
        }
        if (newYearRange.minYear !== 1874) {
          params.append("year_from", newYearRange.minYear);
        }
        if (newYearRange.maxYear !== 2016) {
          params.append("year_to", newYearRange.maxYear);
        }
        const endpoint =
          currentTab === "popular"
            ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
            : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
        console.log("Отправляем запрос на эндпоинт:", endpoint);
        console.log("С параметрами:", params.toString());
        fetchFilteredRecommendations(endpoint, params);
      }
    } else {
      console.log(
        "ID пользователя не указан, фильтры сохранены, но не применены",
      );
    }
  };
  const clearAllFilters = () => {
    console.log("Очищаем все фильтры");
    setSelectedGenres([]);
    setSelectedRatings([]);
    setYearRange({ minYear: 1874, maxYear: 2016 });
    setBestFirst(true);
    setGenreFilterActive(false);
    setRatingFilterActive(false);
    setYearFilterActive(false);
    const currentTab = activeTab;
    if (userIdInput) {
      if (currentTab === "popular") {
        fetchSimilarUsersRecommendations(userIdInput);
      } else {
        fetchPersonalRecommendations(userIdInput);
      }
    }
  };
  const applyFilters = (currentTab = null) => {
    if (!userIdInput) {
      console.log("Невозможно применить фильтры: ID пользователя не указан");
      return;
    }
    console.log("Применяем фильтры к API с параметрами:", {
      selectedGenres,
      selectedRatings,
      yearRange,
      bestFirst,
    });
    const params = new URLSearchParams();
    if (selectedGenres.length > 0) {
      selectedGenres.forEach((genre) => {
        params.append("genres", GENRE_TRANSLATIONS[genre] || genre);
      });
    }
    if (selectedRatings.length > 0) {
      const minRating = parseInt(selectedRatings[0].charAt(0));
      params.append("min_rating", minRating);
    }
    if (yearRange.minYear !== 1874) {
      params.append("year_from", yearRange.minYear);
    }
    if (yearRange.maxYear !== 2016) {
      params.append("year_to", yearRange.maxYear);
    }
    const tabToUse = currentTab || activeTab;
    const endpoint =
      tabToUse === "popular"
        ? `${API_BASE_URL}/recommend/by-similar-ones/${userIdInput}/filter`
        : `${API_BASE_URL}/recommend/by-ratings/${userIdInput}/filter`;
    console.log("Отправляем запрос на эндпоинт:", endpoint);
    console.log("С параметрами:", params.toString());
    fetchFilteredRecommendations(endpoint, params);
  };
  const fetchFilteredRecommendations = async (endpoint, params) => {
    try {
      setCancelLoad(false);
      const url = `${endpoint}?${params.toString()}`;
      console.log("Отправка запроса:", url);
      setIsLoading(true);
      setShowMovies(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      await new Promise(resolve => setTimeout(resolve, 100));
      const response = await fetch(url, { signal });
      if (cancelLoad) {
        setIsLoading(false); 
        return;
      }
      if (!response.ok) {
        throw new Error("Не удалось получить отфильтрованные рекомендации");
      }
      const data = await response.json();
      if (cancelLoad) {
        setIsLoading(false); 
        return;
      }
      console.log("Получены отфильтрованные рекомендации:", data);
      if (data.message) {
        console.log("Получен ответ с ошибкой:", data);
        setNoResults(true);
        setNoResultsMessage("Для этого пользователя нет рекомендаций.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      let moviesList = [];
      if (Array.isArray(data)) {
        moviesList = data;
      } else if (
        data &&
        data.recommendations &&
        Array.isArray(data.recommendations)
      ) {
        moviesList = data.recommendations;
      } else {
        throw new Error("Неверный формат ответа от API");
      }
      setNoResults(false);
      setNoResultsMessage("");
      if (moviesList.length === 0) {
        setNoResults(true);
        setNoResultsMessage("Нет фильмов, соответствующих выбранным фильтрам.");
        setShowMovies(false);
        setIsLoading(false);
        return;
      }
      if (cancelLoad) {
        setIsLoading(false); 
        return;
      }
      const formattedMovies = moviesList.map((movie) => {
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
      console.log("Отформатированные фильмы:", formattedMovies);
      setMovies(formattedMovies);
      setShowMovies(true);
      setIsLoading(false); 
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Запрос был отменен');
        setIsLoading(false); 
        return;
      }
      console.error(
        "Ошибка при получении отфильтрованных рекомендаций:",
        error,
      );
      if (!cancelLoad) {
        setNoResults(true);
        setNoResultsMessage(
          "Произошла ошибка при применении фильтров. Пожалуйста, попробуйте еще раз.",
        );
        setShowMovies(false);
        setIsLoading(false);
      }
    }
  };
  const handleBackToMain = () => {
    navigate("/");
  };
  const handleCancelLoad = () => {
    setCancelLoad(true);
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
        <div className={styles.topCard}>
          <div className={styles.cardContent}>
            <h1 className={styles.mainTitle}>Кино на любой вкус</h1>
            <p className={styles.subtitle}>
              Уникальные рекомендации, основанные на ваших предпочтениях.
            </p>
            <div className={styles.tabButtons}>
              <button
                className={
                  activeTab === "personal"
                    ? styles.activeButton
                    : styles.inactiveButton
                }
                onClick={() => handleTabChange("personal")}
              >
                Персональные рекомендации
              </button>
              <button
                className={
                  activeTab === "popular"
                    ? styles.activeButton
                    : styles.inactiveButton
                }
                onClick={() => handleTabChange("popular")}
              >
                Популярно у пользователей с похожим вкусом
              </button>
            </div>
            <div className={styles.tapeContainer}>
              <img src={tape} alt="Tape" className={styles.tape} />
            </div>
          </div>
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <img src={searchIcon} alt="Search" className={styles.searchIcon}></img>
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearch}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={handleClearSearch}
              >
                <img src={clearIcon} alt="Clear" />
              </button>
            )}
          </div>
          <button
            className={styles.filterButton}
            onClick={() => setShowFiltersModal(true)}
            disabled={filtersDisabled}
          >
            <img src={filterIcon} alt="Filters" />
            <span>Фильтры</span>
            {(genreFilterActive || ratingFilterActive || yearFilterActive) && (
              <span className={styles.filterBadge}></span>
            )}
          </button>
        </div>
        <div className={styles.userSection}>
          <h2 className={styles.userTitle}>{userTitle}</h2>
          <div className={styles.userIdSearch}>
            <img src={searchIcon} alt="Search" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Выбрать id пользователя..."
              className={styles.userIdInput}
              value={userIdInput}
              onChange={handleUserIdChange}
              onKeyDown={handleUserIdSearch}
            />
          </div>
        </div>
        {showMovies ? (
          <div className={styles.movieGrid}>
            {movies.map((movie, index) => (
              <div
              key={movie.id}
              className={styles.movieCard}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleMovieClick(movie.id)}
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
          <div className={styles.placeholder}>
            Введите название фильма или ID пользователя для поиска фильмов
          </div>
        )}
        <FiltersModal
          isOpen={showFiltersModal}
          onClose={() => setShowFiltersModal(false)}
          genres={genres}
          ratingOptions={ratingOptions}
          selectedGenres={selectedGenres}
          selectedRatings={selectedRatings}
          yearRange={yearRange}
          bestFirst={bestFirst}
          genreTranslations={GENRE_TRANSLATIONS}
          onApply={applyAllFilters}
          onClear={clearAllFilters}
        />
      </div>
    </>
  );
}
