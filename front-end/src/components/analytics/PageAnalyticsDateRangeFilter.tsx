import { useEffect, useRef, useState } from 'react';
import { CalendarDaysIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import {
  type AnalyticsDateRange,
  type AnalyticsDateRangePreset,
  type AnalyticsQuickPreset,
  getPresetDateRange,
  getTodayDateKey,
  isMoreAnalyticsPreset,
  isValidAnalyticsDateRange,
  normalizeAnalyticsDateRange,
} from '@/utils/analytics-date-range';

type PageAnalyticsDateRangeFilterProps = {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
};

const QUICK_OPTIONS: Array<{ value: AnalyticsQuickPreset; label: string }> = [
  { value: '24h', label: '24 giờ' },
  { value: '7d', label: '7 ngày' },
  { value: '28d', label: '28 ngày' },
  { value: '3m', label: '3 tháng' },
];

const MORE_OPTIONS: Array<{ value: Exclude<AnalyticsDateRangePreset, AnalyticsQuickPreset>; label: string }> = [
  { value: '6m', label: '6 tháng trước' },
  { value: '12m', label: '12 tháng trước' },
  { value: '16m', label: '16 tháng trước' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

export function PageAnalyticsDateRangeFilter({ value, onChange }: PageAnalyticsDateRangeFilterProps) {
  const today = getTodayDateKey();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = isMoreAnalyticsPreset(value.preset);

  const rangeError =
    value.preset === 'custom' && !isValidAnalyticsDateRange(value.startDate, value.endDate)
      ? 'Ngày bắt đầu phải trước ngày kết thúc và phạm vi tối đa là 2 năm.'
      : '';

  useEffect(() => {
    if (!moreOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [moreOpen]);

  const handleQuickPreset = (preset: AnalyticsQuickPreset) => {
    setMoreOpen(false);
    onChange({
      preset,
      ...getPresetDateRange(preset),
    });
  };

  const handleMorePreset = (preset: Exclude<AnalyticsDateRangePreset, AnalyticsQuickPreset>) => {
    if (preset === 'custom') {
      onChange({ ...value, preset: 'custom' });
      return;
    }

    setMoreOpen(false);
    onChange({
      preset,
      ...getPresetDateRange(preset),
    });
  };

  const handleStartChange = (startDate: string) => {
    const normalized = normalizeAnalyticsDateRange(startDate, value.endDate, 'start');
    onChange({
      preset: 'custom',
      ...normalized,
    });
  };

  const handleEndChange = (endDate: string) => {
    const normalized = normalizeAnalyticsDateRange(value.startDate, endDate, 'end');
    onChange({
      preset: 'custom',
      ...normalized,
    });
  };

  return (
    <div className="page-analytics-date-filter">
      <div className="page-analytics-range-segmented" role="group" aria-label="Phạm vi thời gian">
        {QUICK_OPTIONS.map((option) => {
          const isActive = value.preset === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`page-analytics-range-segment${isActive ? ' is-active' : ''}`}
              aria-pressed={isActive}
              onClick={() => handleQuickPreset(option.value)}
            >
              {isActive ? <CheckIcon className="page-analytics-range-check" aria-hidden="true" /> : null}
              <span>{option.label}</span>
            </button>
          );
        })}

        <div className="page-analytics-range-more" ref={moreRef}>
          <button
            type="button"
            className={`page-analytics-range-segment page-analytics-range-more-trigger${moreActive ? ' is-active' : ''}`}
            aria-pressed={moreActive}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            onClick={() => setMoreOpen((open) => !open)}
          >
            {moreActive ? <CheckIcon className="page-analytics-range-check" aria-hidden="true" /> : null}
            <span>Thêm</span>
            <ChevronDownIcon className="page-analytics-range-chevron" aria-hidden="true" />
          </button>

          {moreOpen ? (
            <div className="page-analytics-range-more-menu" role="menu">
              {MORE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={value.preset === option.value}
                  className={`page-analytics-range-more-item${value.preset === option.value ? ' is-active' : ''}`}
                  onClick={() => handleMorePreset(option.value)}
                >
                  {value.preset === option.value ? (
                    <CheckIcon className="page-analytics-range-check" aria-hidden="true" />
                  ) : (
                    <span className="page-analytics-range-check-placeholder" aria-hidden="true" />
                  )}
                  <span>{option.label}</span>
                </button>
              ))}

              {value.preset === 'custom' ? (
                <div className="page-analytics-date-filter-custom">
                  <label className="page-analytics-date-field">
                    <span className="page-analytics-date-field-label">Ngày bắt đầu</span>
                    <span className="page-analytics-date-field-control">
                      <input
                        type="date"
                        className="page-analytics-date-input"
                        value={value.startDate}
                        max={value.endDate}
                        onChange={(event) => handleStartChange(event.target.value)}
                      />
                      <CalendarDaysIcon className="page-analytics-date-icon" aria-hidden="true" />
                    </span>
                  </label>

                  <span className="page-analytics-date-separator" aria-hidden="true">
                    -
                  </span>

                  <label className="page-analytics-date-field">
                    <span className="page-analytics-date-field-label">Ngày kết thúc</span>
                    <span className="page-analytics-date-field-control">
                      <input
                        type="date"
                        className="page-analytics-date-input"
                        value={value.endDate}
                        min={value.startDate}
                        max={today}
                        onChange={(event) => handleEndChange(event.target.value)}
                      />
                      <CalendarDaysIcon className="page-analytics-date-icon" aria-hidden="true" />
                    </span>
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {rangeError ? <p className="field-error page-analytics-date-filter-error">{rangeError}</p> : null}
    </div>
  );
}
