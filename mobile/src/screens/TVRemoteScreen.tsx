import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { tvClient } from '../api/tvClient';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 380;

export const TVRemoteScreen = () => {
  const tvIp = useSelector((state: RootState) => state.settings.tvIp);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (tvIp) {
      tvClient.connect(
        tvIp,
        () => setConnected(true),
        () => setConnected(false)
      );
    }
    return () => {
      tvClient.disconnect();
    };
  }, [tvIp]);

  const handleCommand = (key: string) => {
    tvClient.sendKey(key);
  };

  const RemoteBtn = ({ icon, text, onPress, color = colors.surface, textColor = colors.text, flex = 1, height = 50, textSize, style }: any) => (
    <TouchableOpacity 
      style={[
        styles.baseBtn, 
        { backgroundColor: color, flex, height }, 
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <Ionicons name={icon} size={22} color={textColor} />}
      {text && <Text style={[styles.btnText, { color: textColor, marginTop: icon ? 4 : 0 }, textSize ? { fontSize: textSize } : null]}>{text}</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Üst Kısım: Güç, Kaynak */}
      <View style={styles.row}>
        <RemoteBtn icon="power" text="POWER" onPress={() => handleCommand('KEY_POWER')} color="rgba(239, 68, 68, 0.15)" textColor={colors.danger} />
        <RemoteBtn icon="log-in-outline" text="SOURCE" onPress={() => handleCommand('KEY_SOURCE')} color="rgba(59, 130, 246, 0.15)" textColor={colors.primary} />
      </View>

      {/* Numpad */}
      <View style={styles.sectionContainer}>
        <View style={styles.row}>
          <RemoteBtn text="1" onPress={() => handleCommand('KEY_1')} textSize={20} />
          <RemoteBtn text="2" onPress={() => handleCommand('KEY_2')} textSize={20} />
          <RemoteBtn text="3" onPress={() => handleCommand('KEY_3')} textSize={20} />
        </View>
        <View style={styles.row}>
          <RemoteBtn text="4" onPress={() => handleCommand('KEY_4')} textSize={20} />
          <RemoteBtn text="5" onPress={() => handleCommand('KEY_5')} textSize={20} />
          <RemoteBtn text="6" onPress={() => handleCommand('KEY_6')} textSize={20} />
        </View>
        <View style={styles.row}>
          <RemoteBtn text="7" onPress={() => handleCommand('KEY_7')} textSize={20} />
          <RemoteBtn text="8" onPress={() => handleCommand('KEY_8')} textSize={20} />
          <RemoteBtn text="9" onPress={() => handleCommand('KEY_9')} textSize={20} />
        </View>
        <View style={styles.row}>
          <RemoteBtn text="-" onPress={() => handleCommand('KEY_MINUS')} textSize={20} />
          <RemoteBtn text="0" onPress={() => handleCommand('KEY_0')} textSize={20} />
          <RemoteBtn text="PRE-CH" onPress={() => handleCommand('KEY_PRECH')} />
        </View>
      </View>

      {/* Ses ve Kanal Kontrolleri */}
      <View style={styles.volChContainer}>
        <View style={styles.rocker}>
          <TouchableOpacity style={styles.rockerBtn} onPress={() => handleCommand('KEY_VOLUP')}>
            <Ionicons name="add" size={26} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.rockerMiddle}>
            <Text style={styles.rockerLabel}>VOL</Text>
          </View>
          <TouchableOpacity style={styles.rockerBtn} onPress={() => handleCommand('KEY_VOLDOWN')}>
            <Ionicons name="remove" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.muteColumn}>
          <RemoteBtn icon="volume-mute" onPress={() => handleCommand('KEY_MUTE')} flex={0} height={50} style={{ width: 60, marginBottom: 12 }} />
          <RemoteBtn text="CH LIST" onPress={() => handleCommand('KEY_CH_LIST')} flex={0} height={50} style={{ width: 60 }} />
        </View>

        <View style={styles.rocker}>
          <TouchableOpacity style={styles.rockerBtn} onPress={() => handleCommand('KEY_CHUP')}>
            <Ionicons name="chevron-up" size={26} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.rockerMiddle}>
            <Text style={styles.rockerLabel}>CH</Text>
          </View>
          <TouchableOpacity style={styles.rockerBtn} onPress={() => handleCommand('KEY_CHDOWN')}>
            <Ionicons name="chevron-down" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MENU - SMART - GUIDE */}
      <View style={styles.row}>
        <RemoteBtn icon="menu" text="MENU" onPress={() => handleCommand('KEY_MENU')} />
        <RemoteBtn icon="apps" text="SMART" onPress={() => handleCommand('KEY_HOME')} color="rgba(16, 185, 129, 0.15)" textColor={colors.accent} />
        <RemoteBtn icon="list" text="GUIDE" onPress={() => handleCommand('KEY_GUIDE')} />
      </View>

      {/* D-Pad Block */}
      <View style={styles.dpadSection}>
        {/* Üst Köşeler */}
        <View style={[styles.row, { justifyContent: 'space-between', paddingHorizontal: 16, gap: 16 }]}>
           <RemoteBtn text="TOOLS" onPress={() => handleCommand('KEY_TOOLS')} flex={1} height={44} style={{ borderRadius: 22 }} />
           <RemoteBtn text="INFO" onPress={() => handleCommand('KEY_INFO')} flex={1} height={44} style={{ borderRadius: 22 }} />
        </View>

        {/* Gerçek D-Pad */}
        <View style={styles.dpadOuter}>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.dpadBtn} onPress={() => handleCommand('KEY_UP')}>
               <Ionicons name="chevron-up" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={[styles.dpadRow, { justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }]}>
             <TouchableOpacity style={styles.dpadBtn} onPress={() => handleCommand('KEY_LEFT')}>
                <Ionicons name="chevron-back" size={32} color={colors.text} />
             </TouchableOpacity>
             <TouchableOpacity style={styles.dpadCenter} onPress={() => handleCommand('KEY_ENTER')}>
                <Text style={styles.dpadCenterText}>OK</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.dpadBtn} onPress={() => handleCommand('KEY_RIGHT')}>
                <Ionicons name="chevron-forward" size={32} color={colors.text} />
             </TouchableOpacity>
          </View>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.dpadBtn} onPress={() => handleCommand('KEY_DOWN')}>
               <Ionicons name="chevron-down" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Alt Köşeler */}
        <View style={[styles.row, { justifyContent: 'space-between', paddingHorizontal: 16, gap: 16 }]}>
           <RemoteBtn icon="return-up-back" text="RETURN" onPress={() => handleCommand('KEY_RETURN')} flex={1} height={44} style={{ borderRadius: 22 }} />
           <RemoteBtn icon="exit" text="EXIT" onPress={() => handleCommand('KEY_EXIT')} flex={1} height={44} style={{ borderRadius: 22 }} />
        </View>
      </View>

      {/* Renkli Butonlar */}
      <View style={[styles.row, { marginTop: 10 }]}>
        <RemoteBtn text="A" color="rgba(239, 68, 68, 0.2)" textColor="#EF4444" height={40} style={{ borderRadius: 20 }} />
        <RemoteBtn text="B" color="rgba(16, 185, 129, 0.2)" textColor="#10B981" height={40} style={{ borderRadius: 20 }} />
        <RemoteBtn text="C" color="rgba(234, 179, 8, 0.2)" textColor="#EAB308" height={40} style={{ borderRadius: 20 }} />
        <RemoteBtn text="D" color="rgba(59, 130, 246, 0.2)" textColor="#3B82F6" height={40} style={{ borderRadius: 20 }} />
      </View>

      {/* Medya Kontrolleri */}
      <View style={styles.sectionContainer}>
        <View style={styles.row}>
          <RemoteBtn icon="play-back" onPress={() => handleCommand('KEY_REWIND')} height={45} />
          <RemoteBtn icon="pause" onPress={() => handleCommand('KEY_PAUSE')} height={45} />
          <RemoteBtn icon="play-forward" onPress={() => handleCommand('KEY_FF')} height={45} />
        </View>
        <View style={styles.row}>
          <RemoteBtn icon="play" onPress={() => handleCommand('KEY_PLAY')} height={45} />
          <RemoteBtn icon="stop" onPress={() => handleCommand('KEY_STOP')} height={45} />
        </View>
      </View>

      <Text style={[styles.statusText, { color: connected ? colors.accent : colors.danger, textAlign: 'center', marginTop: 10 }]}>
          {connected ? 'TV Bağlantısı Aktif' : 'Bağlantı Bekleniyor...'}
      </Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 120, // Sekme barı boşluğu
    alignItems: 'center',
  },
  sectionContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    width: '100%',
  },
  baseBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  btnText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  volChContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    gap: 24,
    width: '100%',
  },
  rocker: {
    backgroundColor: colors.surface,
    borderRadius: 30,
    width: 65,
    height: 140,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rockerBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rockerMiddle: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    width: '80%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rockerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  muteColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 20,
    borderRadius: 32,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dpadOuter: {
    width: 200,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: 100,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    marginVertical: 20,
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadCenter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dpadCenterText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
