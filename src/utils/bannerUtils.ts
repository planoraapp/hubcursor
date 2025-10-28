/**
 * Utility to get a random banner image for page banners
 */

const BANNER_IMAGES = [
  '/assets/site/web_view_bg_br.gif',
  '/assets/site/web_view_bg_de.gif',
  '/assets/site/web_view_bg_es.gif',
  '/assets/site/web_view_bg_fi.gif',
  '/assets/site/web_view_bg_fr.gif',
  '/assets/site/web_view_bg_it.gif',
  '/assets/site/web_view_bg_nl.gif',
  '/assets/site/web_view_bg_no.gif',
  '/assets/site/web_view_bg_ru.gif',
  '/assets/site/web_view_bg_uk.gif',
  '/assets/site/web_view_bg_us.gif',
];

/**
 * Returns a random banner image from the available set
 */
export const getRandomBannerImage = (): string => {
  const randomIndex = Math.floor(Math.random() * BANNER_IMAGES.length);
  return BANNER_IMAGES[randomIndex];
};

/**
 * Returns a stable banner image based on a seed (e.g., page name)
 * This ensures the same page always gets the same banner
 */
export const getBannerImageBySeed = (seed: string): string => {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % BANNER_IMAGES.length;
  return BANNER_IMAGES[index];
};

