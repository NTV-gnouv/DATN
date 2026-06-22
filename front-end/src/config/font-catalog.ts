export type FontCategory = 'modern' | 'classic' | 'creative' | 'future' | 'logo';

export type FontPairing = {
  id: string;
  category: FontCategory;
  label: string;
  displayFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  headingSize: number;
  bodySize: number;
  lineHeight: number;
  headingLetterSpacing: number;
  headingTransform: 'none' | 'uppercase';
  tags: string[];
};

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  modern: 'Hiện đại',
  classic: 'Cổ điển',
  creative: 'Sáng tạo',
  future: 'Tương lai',
  logo: 'Logo',
};

export const FONT_CATEGORIES: FontCategory[] = ['modern', 'classic', 'creative', 'future', 'logo'];

export const FONT_PAIRINGS: FontPairing[] = [
  { id: 'modern-inter', category: 'modern', label: 'Inter Clean', displayFont: 'Inter', bodyFont: 'Inter', headingWeight: 700, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: -0.02, headingTransform: 'none', tags: ['clean', 'professional', 'tech'] },
  { id: 'modern-poppins', category: 'modern', label: 'Poppins Friendly', displayFont: 'Poppins', bodyFont: 'Open Sans', headingWeight: 700, bodyWeight: 400, headingSize: 34, bodySize: 16, lineHeight: 1.55, headingLetterSpacing: -0.01, headingTransform: 'none', tags: ['friendly', 'warm', 'lifestyle'] },
  { id: 'modern-montserrat', category: 'modern', label: 'Montserrat Bold', displayFont: 'Montserrat', bodyFont: 'Lato', headingWeight: 800, bodyWeight: 400, headingSize: 34, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0, headingTransform: 'none', tags: ['bold', 'business', 'startup'] },
  { id: 'modern-dm-sans', category: 'modern', label: 'DM Sans', displayFont: 'DM Sans', bodyFont: 'DM Sans', headingWeight: 700, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.55, headingLetterSpacing: -0.02, headingTransform: 'none', tags: ['minimal', 'clean', 'modern'] },
  { id: 'modern-plus-jakarta', category: 'modern', label: 'Plus Jakarta', displayFont: 'Plus Jakarta Sans', bodyFont: 'Inter', headingWeight: 700, bodyWeight: 400, headingSize: 33, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: -0.015, headingTransform: 'none', tags: ['modern', 'saas', 'product'] },
  { id: 'modern-outfit', category: 'modern', label: 'Outfit Geometric', displayFont: 'Outfit', bodyFont: 'Work Sans', headingWeight: 700, bodyWeight: 400, headingSize: 34, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0.01, headingTransform: 'none', tags: ['geometric', 'tech', 'youth'] },
  { id: 'classic-playfair', category: 'classic', label: 'Playfair Editorial', displayFont: 'Playfair Display', bodyFont: 'Source Sans 3', headingWeight: 700, bodyWeight: 400, headingSize: 36, bodySize: 17, lineHeight: 1.6, headingLetterSpacing: 0, headingTransform: 'none', tags: ['editorial', 'art', 'photography', 'luxury'] },
  { id: 'classic-cormorant', category: 'classic', label: 'Cormorant Elegant', displayFont: 'Cormorant Garamond', bodyFont: 'Raleway', headingWeight: 700, bodyWeight: 400, headingSize: 38, bodySize: 16, lineHeight: 1.6, headingLetterSpacing: 0.01, headingTransform: 'none', tags: ['elegant', 'fashion', 'classic'] },
  { id: 'classic-libre', category: 'classic', label: 'Libre Baskerville', displayFont: 'Libre Baskerville', bodyFont: 'Lora', headingWeight: 700, bodyWeight: 400, headingSize: 34, bodySize: 17, lineHeight: 1.65, headingLetterSpacing: 0, headingTransform: 'none', tags: ['serif', 'writer', 'blog'] },
  { id: 'classic-merriweather', category: 'classic', label: 'Merriweather', displayFont: 'Merriweather', bodyFont: 'Open Sans', headingWeight: 700, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.6, headingLetterSpacing: 0, headingTransform: 'none', tags: ['readable', 'professional', 'content'] },
  { id: 'creative-marker', category: 'creative', label: 'Permanent Marker', displayFont: 'Permanent Marker', bodyFont: 'Rubik', headingWeight: 400, bodyWeight: 400, headingSize: 30, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0, headingTransform: 'none', tags: ['creative', 'art', 'handmade', 'fun'] },
  { id: 'creative-pacifico', category: 'creative', label: 'Pacifico Script', displayFont: 'Pacifico', bodyFont: 'Nunito', headingWeight: 400, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.55, headingLetterSpacing: 0, headingTransform: 'none', tags: ['casual', 'food', 'lifestyle', 'warm'] },
  { id: 'creative-bebas', category: 'creative', label: 'Bebas Neue', displayFont: 'Bebas Neue', bodyFont: 'Work Sans', headingWeight: 400, bodyWeight: 400, headingSize: 40, bodySize: 16, lineHeight: 1.45, headingLetterSpacing: 0.04, headingTransform: 'uppercase', tags: ['bold', 'poster', 'sport', 'impact'] },
  { id: 'creative-abril', category: 'creative', label: 'Abril Fatface', displayFont: 'Abril Fatface', bodyFont: 'Poppins', headingWeight: 400, bodyWeight: 400, headingSize: 36, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0, headingTransform: 'none', tags: ['fashion', 'beauty', 'creative'] },
  { id: 'creative-caveat', category: 'creative', label: 'Caveat Handwritten', displayFont: 'Caveat', bodyFont: 'Inter', headingWeight: 700, bodyWeight: 400, headingSize: 34, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0, headingTransform: 'none', tags: ['personal', 'friendly', 'journal'] },
  { id: 'creative-handrawn', category: 'creative', label: 'Delicious Handrawn', displayFont: 'Delicious Handrawn', bodyFont: 'Elms Sans', headingWeight: 400, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.7, headingLetterSpacing: 0, headingTransform: 'none', tags: ['handmade', 'sketch', 'warm', 'illustration', 'organic'] },
  { id: 'creative-doodle', category: 'creative', label: 'Delius Doodle', displayFont: 'Delius Swash Caps', bodyFont: 'Delius Swash Caps', headingWeight: 600, bodyWeight: 400, headingSize: 30, bodySize: 15, lineHeight: 1.5, headingLetterSpacing: 0, headingTransform: 'none', tags: ['doodle', 'sketch', 'playful', 'creative', 'fun'] },
  { id: 'creative-riso', category: 'creative', label: 'Risograph Space', displayFont: 'Space Grotesk', bodyFont: 'Space Grotesk', headingWeight: 700, bodyWeight: 400, headingSize: 32, bodySize: 15, lineHeight: 1.5, headingLetterSpacing: -0.02, headingTransform: 'none', tags: ['risograph', 'print', 'art', 'zine', 'poster'] },
  { id: 'retro-pixel', category: 'future', label: 'Silkscreen Retro', displayFont: 'Silkscreen', bodyFont: 'Silkscreen', headingWeight: 700, bodyWeight: 400, headingSize: 28, bodySize: 14, lineHeight: 1.45, headingLetterSpacing: 0.02, headingTransform: 'none', tags: ['retro', 'pixel', 'gaming', 'developer', 'nostalgia'] },
  { id: 'future-orbitron', category: 'future', label: 'Orbitron Sci-Fi', displayFont: 'Orbitron', bodyFont: 'Exo 2', headingWeight: 700, bodyWeight: 400, headingSize: 30, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: 0.06, headingTransform: 'uppercase', tags: ['tech', 'gaming', 'ai', 'cyber'] },
  { id: 'future-space', category: 'future', label: 'Space Grotesk', displayFont: 'Space Grotesk', bodyFont: 'Inter', headingWeight: 700, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.5, headingLetterSpacing: -0.02, headingTransform: 'none', tags: ['tech', 'startup', 'modern'] },
  { id: 'future-audiowide', category: 'future', label: 'Audiowide', displayFont: 'Audiowide', bodyFont: 'Rajdhani', headingWeight: 400, bodyWeight: 500, headingSize: 28, bodySize: 16, lineHeight: 1.45, headingLetterSpacing: 0.08, headingTransform: 'uppercase', tags: ['gaming', 'esport', 'future'] },
  { id: 'logo-oswald', category: 'logo', label: 'Oswald Strong', displayFont: 'Oswald', bodyFont: 'Roboto', headingWeight: 700, bodyWeight: 400, headingSize: 36, bodySize: 16, lineHeight: 1.45, headingLetterSpacing: 0.02, headingTransform: 'uppercase', tags: ['brand', 'logo', 'strong'] },
  { id: 'logo-anton', category: 'logo', label: 'Anton Impact', displayFont: 'Anton', bodyFont: 'Inter', headingWeight: 400, bodyWeight: 400, headingSize: 38, bodySize: 16, lineHeight: 1.4, headingLetterSpacing: 0.03, headingTransform: 'uppercase', tags: ['impact', 'bold', 'marketing'] },
];

const pairingMap = new Map(FONT_PAIRINGS.map((item) => [item.id, item]));

export function getFontPairing(id: string | undefined | null): FontPairing {
  return pairingMap.get(String(id ?? '').trim()) ?? FONT_PAIRINGS[0];
}

export function listPairingsByCategory(category: FontCategory): FontPairing[] {
  return FONT_PAIRINGS.filter((item) => item.category === category);
}
