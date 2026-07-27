/**
 * Maps ClimateType enum values to representative Unsplash landscape photo URLs.
 * Used as banner images on Zone cards and zone detail pages.
 */

export const ZONE_IMAGES = {
  TROPICAL:  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80&auto=format&fit=crop',
  ALPINE:    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format&fit=crop',
  WETLAND:   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80&auto=format&fit=crop',
  ARID:      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80&auto=format&fit=crop',
  TEMPERATE: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80&auto=format&fit=crop',
};

/** Returns the zone image URL for a climate type, defaulting to TROPICAL. */
export const getZoneImage = (climate) =>
  ZONE_IMAGES[climate] ?? ZONE_IMAGES.TROPICAL;
