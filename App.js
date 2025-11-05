import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ListScreen" 
        component={ListScreen}
        options={{ 
          title: 'Superheroes',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="DetailScreen" 
        component={DetailScreen}
        options={{ 
          title: 'Hero Details',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesList" 
        component={FavoritesScreen}
        options={{ 
          title: 'My Favorites',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen 
        name="DetailScreen" 
        component={DetailScreen}
        options={{ 
          title: 'Hero Details',
          headerStyle: { backgroundColor: '#6200EE' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home';
              } else if (route.name === 'Favorites') {
                iconName = focused ? 'favorite' : 'favorite-border';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#6200EE',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={ListStack} />
          <Tab.Screen name="Favorites" component={FavoritesStack} />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
