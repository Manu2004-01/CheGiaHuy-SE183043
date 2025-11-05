import AsyncStorage from '@react-native-async-storage/async-storage';

const HEROES_KEY = '@superheroes_data';
const FAVORITES_KEY = '@favorites_ids';

export const saveHeroes = async (heroes) => {
  try {
    const jsonValue = JSON.stringify(heroes);
    await AsyncStorage.setItem(HEROES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving heroes:', error);
    throw error;
  }
};

export const getHeroes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HEROES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting heroes:', error);
    return null;
  }
};

export const getFavoriteIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addFavorite = async (heroId) => {
  try {
    const favorites = await getFavoriteIds();
    // Convert heroId to string for consistent storage
    const idStr = String(heroId);
    if (!favorites.includes(idStr)) {
      favorites.push(idStr);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (heroId) => {
  try {
    const favorites = await getFavoriteIds();
    // Convert heroId to string for consistent comparison
    const idStr = String(heroId);
    const filtered = favorites.filter(id => id !== idStr && String(id) !== idStr);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const isFavorite = async (heroId) => {
  try {
    const favorites = await getFavoriteIds();
    // Convert heroId to string for consistent comparison
    const idStr = String(heroId);
    return favorites.includes(idStr) || favorites.includes(Number(heroId));
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const getFavoriteHeroes = async () => {
  try {
    const favoriteIds = await getFavoriteIds();
    const allHeroes = await getHeroes();
    if (!allHeroes) return [];
    // Convert both to strings for comparison to handle number/string mismatch
    return allHeroes.filter(hero => favoriteIds.includes(String(hero.id)) || favoriteIds.includes(Number(hero.id)));
  } catch (error) {
    console.error('Error getting favorite heroes:', error);
    return [];
  }
};
