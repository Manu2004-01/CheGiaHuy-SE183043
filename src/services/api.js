const API_BASE_URL = 'https://superheroapi.com/api';
// Note: You'll need to get a free API key from https://superheroapi.com/
// For now, using a placeholder - replace with your actual API key
const API_KEY = '8635f86b22c593d828bfa2af7f927c0b';

export const fetchAllSuperheroes = async () => {
  try {
    // Superhero API doesn't have a direct "all" endpoint
    // We'll fetch heroes by ID (1-731 are available)
    const heroes = [];
    const maxId = 731;
    const batchSize = 10;
    // Increase limit to fetch more heroes (can be adjusted based on API rate limits)
    const fetchLimit = 200;
    
    // Fetch in batches to avoid too many requests
    for (let i = 1; i <= Math.min(fetchLimit, maxId); i += batchSize) {
      const batchPromises = [];
      for (let j = i; j < i + batchSize && j <= Math.min(fetchLimit, maxId); j++) {
        batchPromises.push(fetchHeroById(j));
      }
      const batchResults = await Promise.allSettled(batchPromises);
      const validHeroes = batchResults
        .filter(r => r.status === 'fulfilled' && r.value && r.value.response !== 'error')
        .map(r => r.value);
      heroes.push(...validHeroes);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return heroes.filter(hero => hero && hero.response !== 'error');
  } catch (error) {
    console.error('Error fetching superheroes:', error);
    throw error;
  }
};

export const fetchHeroById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/${id}`);
    const data = await response.json();
    // Superhero API returns data with response field
    if (data.response === 'error') {
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching hero ${id}:`, error);
    return null;
  }
};

export const searchHeroes = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_KEY}/search/${name}`);
    const data = await response.json();
    if (data.response === 'success' && data.results) {
      return data.results;
    }
    return [];
  } catch (error) {
    console.error('Error searching heroes:', error);
    throw error;
  }
};
