import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setAppMode } from '../store/settingsSlice';

import { MediaScreen } from '../screens/MediaScreen';
import { SystemScreen } from '../screens/SystemScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ModeSelectionScreen } from '../screens/ModeSelectionScreen';
import { TVRemoteScreen } from '../screens/TVRemoteScreen';
import { TVSettingsScreen } from '../screens/TVSettingsScreen';
import { colors } from '../theme/colors';
import { TouchableOpacity, View } from 'react-native';

const Tab = createBottomTabNavigator();

// Ortak tab bar stilleri
const screenOptions = ({ route }: any) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: 'rgba(255,255,255,0.05)',
    elevation: 0,
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
});

const PCTabNavigator = () => (
  <Tab.Navigator
    screenOptions={(props) => {
      const options = screenOptions(props);
      return {
        ...options,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (props.route.name === 'Medya') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (props.route.name === 'Sistem') {
            iconName = focused ? 'desktop' : 'desktop-outline';
          } else if (props.route.name === 'Ayarlar') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      };
    }}
  >
    <Tab.Screen name="Medya" component={MediaScreen} />
    <Tab.Screen name="Sistem" component={SystemScreen} />
    <Tab.Screen name="Ayarlar" component={SettingsScreen} />
  </Tab.Navigator>
);

const TVTabNavigator = () => (
  <Tab.Navigator
    screenOptions={(props) => {
      const options = screenOptions(props);
      return {
        ...options,
        tabBarActiveTintColor: colors.accent,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (props.route.name === 'TV Kumanda') {
            iconName = focused ? 'tv' : 'tv-outline';
          } else if (props.route.name === 'Ayarlar') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      };
    }}
  >
    <Tab.Screen name="TV Kumanda" component={TVRemoteScreen} />
    <Tab.Screen name="Ayarlar" component={TVSettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const appMode = useSelector((state: RootState) => state.settings.appMode);
  const dispatch = useDispatch();

  return (
    <NavigationContainer theme={DarkTheme}>
      {appMode === null ? (
        <ModeSelectionScreen />
      ) : (
        <View style={{ flex: 1 }}>
          {appMode === 'PC' ? <PCTabNavigator /> : <TVTabNavigator />}
        </View>
      )}
    </NavigationContainer>
  );
};

