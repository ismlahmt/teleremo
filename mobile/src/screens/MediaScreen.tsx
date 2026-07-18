import React, { useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { RemoteButton } from '../components/RemoteButton';
import { sendCommand } from '../api/client';
import { colors } from '../theme/colors';

export const MediaScreen = () => {
  const intervalRef = useRef<any>(null);

  const handleCommand = async (endpoint: string) => {
    try {
      await sendCommand(`media/${endpoint}`);
    } catch (e) {
      // Hata yönetimi (gerekirse bir toast eklenebilir)
    }
  };

  const startRepeatingCommand = (endpoint: string) => {
    handleCommand(endpoint); // İlk tıklandığında anında bir kez çalıştır
    intervalRef.current = setInterval(() => {
      handleCommand(endpoint);
    }, 200); // Basılı tutulduğu sürece her 200 milisaniyede bir komut gönder
  };

  const stopRepeatingCommand = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { marginBottom: 30 }]}>Medya Kontrolü</Text>

      {/* Üst Kısım: Uygulama İçi Ses */}
      <View style={styles.row}>
        <RemoteButton iconName="volume-medium-outline" label="Kıs" onPress={() => handleCommand('vol_down')} color={colors.text} style={styles.flexBtn} />
        <RemoteButton iconName="volume-mute-outline" label="Sustur" onPress={() => handleCommand('mute')} color={colors.danger} style={styles.flexBtn} />
        <RemoteButton iconName="volume-high-outline" label="Aç" onPress={() => handleCommand('vol_up')} color={colors.text} style={styles.flexBtn} />
      </View>
      <Text style={styles.sectionLabel}>Uygulama Sesi</Text>

      {/* Alt Kısım: Oynatma Kontrolleri */}
      <View style={styles.playbackContainer}>
        <RemoteButton 
          iconName="play-back-outline" 
          label="Geri"
          onPressIn={() => startRepeatingCommand('backward')} 
          onPressOut={stopRepeatingCommand}
          color={colors.text} 
          style={styles.playbackBtn}
        />
        <RemoteButton 
          iconName="pause-circle-outline" 
          size="large"
          onPress={() => handleCommand('play_pause')} 
          color={colors.accent} 
          style={styles.playPauseBtn}
        />
        <RemoteButton 
          iconName="play-forward-outline" 
          label="İleri"
          onPressIn={() => startRepeatingCommand('forward')} 
          onPressOut={stopRepeatingCommand}
          color={colors.text} 
          style={styles.playbackBtn}
        />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  flexBtn: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 12,
  },
  playbackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  playbackBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    padding: 12,
  },
  playPauseBtn: {
    flex: 1.5,
    aspectRatio: 1,
    marginHorizontal: 10,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Accent rengin transparan hali
    borderColor: colors.accent,
  }
});
