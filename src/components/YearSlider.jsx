import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./FilterModal.module.css";
const YearSlider = ({
  minYear = 1874,
  maxYear = 2016,
  onChange,
  initialYearRange,
}) => {
  const [minValue, setMinValue] = useState(
    initialYearRange?.minYear || minYear,
  );
  const [maxValue, setMaxValue] = useState(
    initialYearRange?.maxYear || maxYear,
  );
  const [activeThumb, setActiveThumb] = useState(null);
  const sliderRef = useRef(null);
  const minThumbRef = useRef(null);
  const maxThumbRef = useRef(null);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    if (initialYearRange && !isDraggingRef.current) {
      setMinValue(initialYearRange.minYear);
      setMaxValue(initialYearRange.maxYear);
    }
  }, [initialYearRange]);
  const handleChange = useCallback(() => {
    onChange({
      minYear: minValue,
      maxYear: maxValue,
    });
  }, [minValue, maxValue, onChange]);
  useEffect(() => {
    handleChange();
  }, [handleChange]);
  const getPercent = useCallback((value) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  }, [minYear, maxYear]);
  const getValueFromPosition = useCallback((position) => {
    if (!sliderRef.current) return 0;
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const percent = (position - sliderRect.left) / sliderRect.width;
    const value = Math.round(minYear + percent * (maxYear - minYear));
    return Math.max(minYear, Math.min(maxYear, value));
  }, [minYear, maxYear]);
  const handleThumbMouseDown = useCallback((e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;
    const handleMouseMove = (moveEvent) => {
      if (!sliderRef.current) return;
      const newValue = getValueFromPosition(moveEvent.clientX);
      if (thumb === "min" && newValue < maxValue) {
        setMinValue(newValue);
      } else if (thumb === "max" && newValue > minValue) {
        setMaxValue(newValue);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setTimeout(() => {
        isDraggingRef.current = false;
        setActiveThumb(null);
      }, 50);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [getValueFromPosition, maxValue, minValue]);
  const handleTouchStart = useCallback((e, thumb) => {
    e.preventDefault();
    setActiveThumb(thumb);
    isDraggingRef.current = true;
    const handleTouchMove = (moveEvent) => {
      if (!sliderRef.current || !moveEvent.touches[0]) return;
      const newValue = getValueFromPosition(moveEvent.touches[0].clientX);
      if (thumb === "min" && newValue < maxValue) {
        setMinValue(newValue);
      } else if (thumb === "max" && newValue > minValue) {
        setMaxValue(newValue);
      }
    };
    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      setTimeout(() => {
        isDraggingRef.current = false;
        setActiveThumb(null);
      }, 50);
    };
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  }, [getValueFromPosition, maxValue, minValue]);
  return (
    <div className={styles.rangeContainer}>
      <div className={styles.yearSlider} ref={sliderRef}>
        {}
        <div className={styles.sliderBackground}></div>
        {}
        <div
          className={styles.sliderTrack}
          style={{
            left: `${getPercent(minValue)}%`,
            width: `${getPercent(maxValue) - getPercent(minValue)}%`,
          }}
        />
        {}
        <div
          className={`${styles.sliderThumb} ${activeThumb === "min" ? styles.active : ""}`}
          ref={minThumbRef}
          style={{ left: `${getPercent(minValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={minValue}
          tabIndex={0}
        >
          <div className={styles.valueLabel}>{minValue}</div>
        </div>
        {}
        <div
          className={`${styles.sliderThumb} ${activeThumb === "max" ? styles.active : ""}`}
          ref={maxThumbRef}
          style={{ left: `${getPercent(maxValue)}%` }}
          onMouseDown={(e) => handleThumbMouseDown(e, "max")}
          onTouchStart={(e) => handleTouchStart(e, "max")}
          role="slider"
          aria-valuemin={minYear}
          aria-valuemax={maxYear}
          aria-valuenow={maxValue}
          tabIndex={0}
        >
          <div className={styles.valueLabel}>{maxValue}</div>
        </div>
      </div>
      {}
      {}
      {}
      <input type="hidden" name="min-year" value={minValue} />
      <input type="hidden" name="max-year" value={maxValue} />
    </div>
  );
};
export default React.memo(YearSlider);
