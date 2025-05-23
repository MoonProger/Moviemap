import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./FilterModal.module.css";
import YearSlider from "./YearSlider";
import genreIcon from "../assets/genre.svg";
import rateIcon from "../assets/rate.svg";
import yearIcon from "../assets/year.svg";

const FiltersModal = ({
  isOpen,
  onClose,
  genres,
  ratingOptions,
  selectedGenres,
  selectedRatings,
  yearRange,
  bestFirst,
  genreTranslations,
  onApply,
  onClear,
}) => {
  const modalRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  const [tempSelectedGenres, setTempSelectedGenres] = useState([]);
  const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
  const [tempYearRange, setTempYearRange] = useState({
    minYear: 1874,
    maxYear: 2016,
  });
  const tempBestFirst = true;

  useEffect(() => {
    if (isOpen) {
      setTempSelectedGenres([...selectedGenres]);
      setTempSelectedRatings([...selectedRatings]);
      setTempYearRange({ ...yearRange });
    }
  }, [isOpen, selectedGenres, selectedRatings, yearRange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 50);
  }, [onClose]);

  const handleApply = useCallback(() => {
    const filters = {
      selectedGenres: [...tempSelectedGenres],
      selectedRatings: [...tempSelectedRatings],
      yearRange: { ...tempYearRange },
      bestFirst: true,
    };

    console.log("Применяем фильтры из модального окна:", filters);

    setIsClosing(true);
    onClose();
    setTimeout(() => {
      onApply(filters);
      setIsClosing(false);
    }, 50);
  }, [tempSelectedGenres, tempSelectedRatings, tempYearRange, onClose, onApply]);

  const handleApplyEmpty = useCallback(() => {
    const emptyFilters = {
      selectedGenres: [],
      selectedRatings: [],
      yearRange: { minYear: 1874, maxYear: 2016 },
      bestFirst: true,
    };

    console.log("Применяем пустые фильтры:", emptyFilters);

    setIsClosing(true);
    onClose();

    setTimeout(() => {
      onApply(emptyFilters);
      setIsClosing(false);
    }, 50);
  }, [onClose, onApply]);

  const toggleGenreSelection = useCallback((genre) => {
    setTempSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  }, []);

  const toggleRatingSelection = useCallback((rating) => {
    setTempSelectedRatings((prev) => {
      if (prev.includes(rating)) {
        return [];
      } else {
        return [rating];
      }
    });
  }, []);

  const handleTempYearChange = useCallback((range) => {
    setTempYearRange(range);
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Фильтры</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          {/* Жанры */}
          <div>
            <h3 className={styles.modalSubtitle}>
              <img src={genreIcon} alt="Жанры" className={styles.filterIcon} />
              Жанры
            </h3>
            <div className={styles.filterGroup}>
              {genres.map((genre) => (
                <button
                  key={genre}
                  className={`${styles.filterOption} ${tempSelectedGenres.includes(genre) ? styles.active : ""}`}
                  onClick={() => toggleGenreSelection(genre)}
                >
                  <div className={styles.checkboxContainer}>
                    <div
                      className={`${styles.customCheckbox} ${tempSelectedGenres.includes(genre) ? styles.checked : ""}`}
                    >
                      {tempSelectedGenres.includes(genre) && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </div>
                  </div>
                  <span>{genreTranslations[genre] || genre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Рейтинг */}
          <div style={{ marginTop: "30px" }}>
            <h3 className={styles.modalSubtitle}>
              <img src={rateIcon} alt="Рейтинг" className={styles.filterIcon} />
              Рейтинг
            </h3>
            <div className={styles.ratingOptions}>
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  className={`${styles.filterOption} ${tempSelectedRatings.includes(rating) ? styles.active : ""}`}
                  onClick={() => toggleRatingSelection(rating)}
                >
                  <div className={styles.radioContainer}>
                    <div
                      className={`${styles.customRadio} ${tempSelectedRatings.includes(rating) ? styles.checked : ""}`}
                    >
                      {tempSelectedRatings.includes(rating) && (
                        <span className={styles.radioDot}></span>
                      )}
                    </div>
                  </div>
                  <span>
                    {rating === "1+" ? "⭐+" : ""}
                    {rating === "2+" ? "⭐⭐+" : ""}
                    {rating === "3+" ? "⭐⭐⭐+" : ""}
                    {rating === "4+" ? "⭐⭐⭐⭐+" : ""}
                    {rating === "5" ? "⭐⭐⭐⭐⭐" : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Год */}
          <div style={{ marginTop: "30px" }}>
            <h3 className={styles.modalSubtitle}>
              <img src={yearIcon} alt="Год" className={styles.filterIcon} />
              Год выпуска
            </h3>
            <YearSlider
              minYear={1874}
              maxYear={2016}
              initialYearRange={tempYearRange}
              onChange={handleTempYearChange}
            />
          </div>

          {/* Кнопки */}
          <div className={styles.modalFooter}>
            <button
              className={styles.clearButton}
              onClick={handleApplyEmpty}
            >
              Сбросить все
            </button>
            <button className={styles.applyButton} onClick={handleApply}>
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Используем React.memo для предотвращения ненужных перерисовок
export default React.memo(FiltersModal);
