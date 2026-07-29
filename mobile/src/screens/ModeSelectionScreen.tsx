import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { setAppMode } from '../store/settingsSlice';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export const ModeSelectionScreen = () => {
  const dispatch = useDispatch();

  const handleSelectMode = (mode: 'PC' | 'TV') => {
    dispatch(setAppMode(mode));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Teleremo</Text>
      <Text style={styles.headerSubtitle}>Hangi cihazı kontrol etmek istersiniz?</Text>

      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => handleSelectMode('PC')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="desktop-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>PC'ye Bağlan</Text>
          <Text style={styles.cardSubtitle}>Bilgisayarınızı kontrol edin</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          activeOpacity={0.8}
          onPress={() => handleSelectMode('TV')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="tv-outline" size={48} color={colors.accent} />
          </View>
          <Text style={styles.cardTitle}>TV'ye Bağlan</Text>
          <Text style={styles.cardSubtitle}>Samsung Smart TV'nizi kontrol edin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  cardsContainer: {
    gap: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
