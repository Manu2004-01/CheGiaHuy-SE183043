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
import Toast from 'react-native-toast-message';

import { getFavoriteHeroes } from '../services/database';

const FavoritesScreen = ({ navigation }) => {
  const [favoriteHeroes, setFavoriteHeroes] = useState([]);
  const [filteredHeroes, setFilteredHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await getFavoriteHeroes();
      setFavoriteHeroes(favorites);
      setFilteredHeroes(favorites);
      extractCategories(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load favorites',
      });
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
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    filterHeroes();
  }, [searchQuery, selectedCategory, favoriteHeroes]);

  const filterHeroes = () => {
    let filtered = [...favoriteHeroes];

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

  if (favoriteHeroes.length === 0) {
    return (
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites..."
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

        <View style={styles.centered}>
          <Text style={styles.emptyText}>You have no favorites yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search favorites..."
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

      {/* Favorite Heroes List */}
      {filteredHeroes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No favorites found</Text>
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
  placeholderText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
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
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default FavoritesScreen;
