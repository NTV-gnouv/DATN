export type BrandColorSwatch = {
  name: string;
  hex: string;
};

export type BrandGalleryItem = {
  title: string;
  description: string;
};

export type BrandProfile = {
  name: string;
  occupation: string;
  personality_traits: string[];
  brand_style: string;
  short_bio: string;
  long_bio: string;
  color_palette: {
    primary: BrandColorSwatch;
    secondary_1: BrandColorSwatch;
    secondary_2: BrandColorSwatch;
    contrast: BrandColorSwatch;
  };
  image_keywords: string[];
  gallery: BrandGalleryItem[];
};

export type BrandProfileInput = {
  name: string;
  occupation: string;
  description: string;
};
