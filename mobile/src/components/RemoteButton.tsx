import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface RemoteButtonProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  label?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
  size?: 'normal' | 'large';
}

export const RemoteButton: React.FC<RemoteButtonProps> = ({ iconName, label, onPress, onPressIn, onPressOut, style, color = colors.primary, size = 'normal' }) => {
  const isLarge = size === 'large';
  
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: 'transparent' }, style]} 
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.5}
    >
      {iconName && <Ionicons name={iconName} size={isLarge ? 48 : 32} color={color} />}
      {label && <Text style={[styles.label, { color: color, marginTop: iconName ? 8 : 0 }]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)', // Subtle glass background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)', // Premium crisp border
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  }
});
