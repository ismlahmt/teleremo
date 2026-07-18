import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MediaScreen } from '../screens/MediaScreen';
import { SystemScreen } from '../screens/SystemScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: 'rgba(255,255,255,0.05)',
            elevation: 0,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help';

            if (route.name === 'Medya') {
              iconName = focused ? 'play-circle' : 'play-circle-outline';
            } else if (route.name === 'Sistem') {
              iconName = focused ? 'desktop' : 'desktop-outline';
            } else if (route.name === 'Ayarlar') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Medya" component={MediaScreen} />
        <Tab.Screen name="Sistem" component={SystemScreen} />
        <Tab.Screen name="Ayarlar" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
