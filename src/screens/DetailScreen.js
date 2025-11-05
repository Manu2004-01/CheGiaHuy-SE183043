import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { fetchHeroById } from '../services/api';
import { isFavorite, addFavorite, removeFavorite, getHeroes as getCachedHeroes } from '../services/database';

const DetailScreen = ({ route, navigation }) => {
  const { heroId } = route.params;
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);

  const loadHero = async () => {
    try {
      setLoading(true);
      
      // First try to get from cache
      const cachedHeroes = await getCachedHeroes();
      const cachedHero = cachedHeroes?.find(h => h.id === heroId);
      
      if (cachedHero) {
        setHero(cachedHero);
        setLoading(false);
      } else {
        // If not in cache, fetch from API
        const heroData = await fetchHeroById(heroId);
        if (heroData && heroData.response !== 'error') {
          setHero(heroData);
        }
      }

      // Check favorite status
      const isFav = await isFavorite(heroId);
      setFavorite(isFav);
    } catch (error) {
      console.error('Error loading hero:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not load hero details',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadHero();
    }, [heroId])
  );

  const toggleFavorite = async () => {
    try {
      if (favorite) {
        await removeFavorite(heroId);
        setFavorite(false);
        Toast.show({
          type: 'success',
          text1: 'Removed',
          text2: 'Removed from favorites',
        });
      } else {
        await addFavorite(heroId);
        setFavorite(true);
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: 'Added to favorites',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not update favorite',
      });
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
        >
          <Icon
            name={favorite ? 'favorite' : 'favorite-border'}
            size={28}
            color={favorite ? '#FF6B6B' : '#fff'}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, favorite]);


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!hero) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Hero not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroImagePlaceholder}>
        <Text style={styles.placeholderIcon}>🦸</Text>
        <Text style={styles.placeholderText}>Hero Image</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.heroName}>{hero.name || 'Unknown Hero'}</Text>

        {hero.biography && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biography</Text>
            {hero.biography.fullName && (
              <InfoRow label="Full Name" value={hero.biography.fullName} />
            )}
            {hero.biography.alterEgos && hero.biography.alterEgos !== 'null' && (
              <InfoRow label="Alter Egos" value={hero.biography.alterEgos} />
            )}
            {hero.biography.placeOfBirth && hero.biography.placeOfBirth !== 'null' && (
              <InfoRow label="Place of Birth" value={hero.biography.placeOfBirth} />
            )}
            {hero.biography.firstAppearance && (
              <InfoRow label="First Appearance" value={hero.biography.firstAppearance} />
            )}
            {hero.biography.publisher && (
              <InfoRow label="Publisher" value={hero.biography.publisher} />
            )}
            {hero.biography.alignment && (
              <InfoRow label="Alignment" value={hero.biography.alignment} />
            )}
          </View>
        )}

        {hero.powerstats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Power Stats</Text>
            {hero.powerstats.intelligence && (
              <StatRow label="Intelligence" value={hero.powerstats.intelligence} />
            )}
            {hero.powerstats.strength && (
              <StatRow label="Strength" value={hero.powerstats.strength} />
            )}
            {hero.powerstats.speed && (
              <StatRow label="Speed" value={hero.powerstats.speed} />
            )}
            {hero.powerstats.durability && (
              <StatRow label="Durability" value={hero.powerstats.durability} />
            )}
            {hero.powerstats.power && (
              <StatRow label="Power" value={hero.powerstats.power} />
            )}
            {hero.powerstats.combat && (
              <StatRow label="Combat" value={hero.powerstats.combat} />
            )}
          </View>
        )}

        {hero.appearance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            {hero.appearance.gender && (
              <InfoRow label="Gender" value={hero.appearance.gender} />
            )}
            {hero.appearance.race && hero.appearance.race !== 'null' && (
              <InfoRow label="Race" value={hero.appearance.race} />
            )}
            {hero.appearance.height && (
              <InfoRow label="Height" value={hero.appearance.height.join(' / ')} />
            )}
            {hero.appearance.weight && (
              <InfoRow label="Weight" value={hero.appearance.weight.join(' / ')} />
            )}
            {hero.appearance.eyeColor && (
              <InfoRow label="Eye Color" value={hero.appearance.eyeColor} />
            )}
            {hero.appearance.hairColor && (
              <InfoRow label="Hair Color" value={hero.appearance.hairColor} />
            )}
          </View>
        )}

        {hero.work && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work</Text>
            {hero.work.occupation && (
              <InfoRow label="Occupation" value={hero.work.occupation} />
            )}
            {hero.work.base && (
              <InfoRow label="Base" value={hero.work.base} />
            )}
          </View>
        )}

        {hero.connections && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connections</Text>
            {hero.connections.groupAffiliation && (
              <InfoRow label="Group Affiliation" value={hero.connections.groupAffiliation} />
            )}
            {hero.connections.relatives && (
              <InfoRow label="Relatives" value={hero.connections.relatives} />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const StatRow = ({ label, value }) => {
  const numericValue = parseInt(value) || 0;
  const percentage = Math.min(100, numericValue);
  
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}:</Text>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBar, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
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
  },
  heroImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#e0e0e0',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  heroName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  statBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    width: 40,
    textAlign: 'right',
  },
  favoriteButton: {
    marginRight: 16,
    padding: 4,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
});

export default DetailScreen;
