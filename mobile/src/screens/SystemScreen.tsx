import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RemoteButton } from '../components/RemoteButton';
import { sendCommand } from '../api/client';
import { colors } from '../theme/colors';

export const SystemScreen = () => {
  const handleCommand = async (endpoint: string) => {
    try {
      await sendCommand(`system/${endpoint}`);
    } catch (e) {
      // Hata yönetimi
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Bilgisayarım</Text>
      <Text style={styles.headerSubtitle}>Genel Sistem Kontrolleri</Text>

      <View style={styles.controlsContainer}>
        <RemoteButton 
          iconName="albums-outline" 
          size="large"
          label="Uygulama Değiştir"
          onPress={() => handleCommand('alt_tab')} 
          color={colors.accent} 
          style={[styles.bigButton, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: colors.accent }]}
        />

        <RemoteButton 
          iconName="volume-mute" 
          size="large"
          label="Sustur"
          onPress={() => handleCommand('mute')} 
          color={colors.danger} 
          style={[styles.bigButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: colors.danger }]}
        />
        
        <View style={styles.row}>
          <RemoteButton 
            iconName="volume-low" 
            onPress={() => handleCommand('vol_down')} 
            color={colors.text} 
            style={styles.flexBtn} 
          />
          <RemoteButton 
            iconName="volume-high" 
            onPress={() => handleCommand('vol_up')} 
            color={colors.text} 
            style={styles.flexBtn} 
          />
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  controlsContainer: {
    paddingHorizontal: 20,
  },
  bigButton: {
    padding: 40,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexBtn: {
    flex: 1,
    marginHorizontal: 8,
    padding: 24,
  }
});
