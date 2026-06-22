import { useMemo, useState } from 'react';

import {
  FONT_CATEGORIES,
  FONT_CATEGORY_LABELS,
  FONT_PAIRINGS,
  getFontPairing,
  listPairingsByCategory,
  type FontCategory,
  type FontPairing,
} from '@/config/font-catalog';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';

type FontPairingPickerProps = {
  value: string;
  onChange: (pairing: FontPairing) => void;
  disabled?: boolean;
};

function PairingCard({
  pairing,
  selected,
  onSelect,
}: {
  pairing: FontPairing;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`font-pairing-card${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span
        className="font-pairing-card-heading"
        style={{
          fontFamily: `'${pairing.displayFont}', sans-serif`,
          fontWeight: pairing.headingWeight,
          letterSpacing: `${pairing.headingLetterSpacing}em`,
          textTransform: pairing.headingTransform,
        }}
      >
        Heading
      </span>
      <span className="font-pairing-card-body" style={{ fontFamily: `'${pairing.bodyFont}', sans-serif` }}>
        Paragraph
      </span>
    </button>
  );
}

export function FontPairingPicker({ value, onChange, disabled = false }: FontPairingPickerProps) {
  const selected = getFontPairing(value);
  const [category, setCategory] = useState<FontCategory>(selected.category);
  const visiblePairings = listPairingsByCategory(category);
  const previewFamilies = useMemo(
    () => [...new Set(visiblePairings.flatMap((pairing) => [pairing.displayFont, pairing.bodyFont]))],
    [visiblePairings],
  );
  useGoogleFonts(previewFamilies);

  return (
    <div className="font-pairing-picker">
      <div className="font-pairing-tabs" role="tablist" aria-label="Nhóm font">
        {FONT_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            className={`font-pairing-tab${category === item ? ' is-active' : ''}`}
            onClick={() => setCategory(item)}
            disabled={disabled}
          >
            {FONT_CATEGORY_LABELS[item]}
          </button>
        ))}
      </div>
      <div className="font-pairing-grid">
        {visiblePairings.map((pairing) => (
          <PairingCard
            key={pairing.id}
            pairing={pairing}
            selected={pairing.id === selected.id}
            onSelect={() => onChange(pairing)}
          />
        ))}
      </div>
      <p className="muted-copy font-pairing-selected-label">
        Đang chọn: <strong>{selected.label}</strong> — {selected.displayFont} / {selected.bodyFont}
      </p>
    </div>
  );
}

export function findFontPairingId(displayFont: string, bodyFont: string): string {
  const match = FONT_PAIRINGS.find((item) => item.displayFont === displayFont && item.bodyFont === bodyFont);
  return match?.id ?? 'modern-inter';
}