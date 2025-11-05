import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { fetchAllSuperheroes } from '../services/api';
import { saveHeroes, getHeroes } from '../services/database';
import Toast from 'react-native-toast-message';

const ListScreen = ({ navigation }) => {
  const [heroes, setHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API
      try {
        const data = await fetchAllSuperheroes();
        if (data && data.length > 0) {
          setHeroes(data);
          setFilteredHeroes(data);
          await saveHeroes(data);
          extractCategories(data);
        } else {
          throw new Error('No data received');
        }
      } catch (apiError) {
        // If API fails, try to load from database
        const cachedData = await getHeroes();
        if (cachedData && cachedData.length > 0) {
          setHeroes(cachedData);
          setFilteredHeroes(cachedData);
          extractCategories(cachedData);
          Toast.show({
            type: 'info',
            text1: 'Offline Mode',
            text2: 'Showing cached data',
          });
        } else {
          throw new Error('No cached data available');
        }
      }
    } catch (err) {
      setError('Could not load data. Please check your connection.');
      console.error('Error loading heroes:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = (heroesData) => {
    const categorySet = new Set(['all']);
    heroesData.forEach(hero => {
      if (hero.biography && hero.biography.publisher) {
        categorySet.add(hero.biography.publisher);
      }
    });
    setCategories(Array.from(categorySet));
  };

  useFocusEffect(
    useCallback(() => {
      loadHeroes();
    }, [])
  );

  useEffect(() => {
    filterHeroes();
  }, [searchQuery, selectedCategory, heroes]);

  const filterHeroes = () => {
    let filtered = [...heroes];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(hero =>
        hero.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(hero =>
        hero.biography?.publisher === selectedCategory
      );
    }

    setFilteredHeroes(filtered);
  };

  const HeroItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.heroItem}
        onPress={() => navigation.navigate('DetailScreen', { heroId: item.id })}
      >
        <View style={styles.heroImagePlaceholder}>
          <Text style={styles.placeholderIcon}>🦸</Text>
          <Text style={styles.placeholderText}>Hero</Text>
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{item.name || 'Unknown Hero'}</Text>
          {item.biography?.publisher && (
            <Text style={styles.heroPublisher}>{item.biography.publisher}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeroItem = ({ item }) => <HeroItem item={item} />;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (error && heroes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHeroes}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search superheroes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}
            >
              {category === 'all' ? 'All' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hero List */}
      {filteredHeroes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No heroes found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHeroes}
          renderItem={renderHeroItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  categoryContainer: {
    maxHeight: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#6200EE',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 8,
  },
  heroItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  heroImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  heroName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  heroPublisher: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  placeholderText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ListScreen;
