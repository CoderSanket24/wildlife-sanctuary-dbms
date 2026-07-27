/**
 * Maps animal species names (lowercase) to Unsplash wildlife photo URLs.
 * Falls back to FALLBACK_ANIMAL_IMAGE if no species match is found.
 */

export const ANIMAL_IMAGES = {
  'bengal tiger':              'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80&auto=format&fit=crop',
  'indian elephant':           'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=80&auto=format&fit=crop',
  'snow leopard':              'https://images.unsplash.com/photo-1605979399824-6d3d6b9cb0f7?w=600&q=80&auto=format&fit=crop',
  'one-horned rhinoceros':     'https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=600&q=80&auto=format&fit=crop',
  'asiatic lion':              'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=600&q=80&auto=format&fit=crop',
  'indian leopard':            'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=600&q=80&auto=format&fit=crop',
  'red panda':                 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&q=80&auto=format&fit=crop',
  'king cobra':                'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=600&q=80&auto=format&fit=crop',
  'indian rock python':        'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?w=600&q=80&auto=format&fit=crop',
  'saltwater crocodile':       'https://images.unsplash.com/photo-1568183873779-b3b8af7a13b2?w=600&q=80&auto=format&fit=crop',
  'mugger crocodile':          'https://images.unsplash.com/photo-1568183873779-b3b8af7a13b2?w=600&q=80&auto=format&fit=crop',
  'blackbuck':                 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&q=80&auto=format&fit=crop',
  'indian gazelle (chinkara)': 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&q=80&auto=format&fit=crop',
  'lion-tailed macaque':       'https://images.unsplash.com/photo-1597953601374-1ff2d5640c85?w=600&q=80&auto=format&fit=crop',
  'nilgiri tahr':              'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=600&q=80&auto=format&fit=crop',
  'sloth bear':                'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&q=80&auto=format&fit=crop',
};

export const FALLBACK_ANIMAL_IMAGE =
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=600&q=80&auto=format&fit=crop';

/** Returns the image URL for a species, or the fallback if not found. */
export const getAnimalImage = (species) =>
  ANIMAL_IMAGES[species?.toLowerCase()] ?? FALLBACK_ANIMAL_IMAGE;
