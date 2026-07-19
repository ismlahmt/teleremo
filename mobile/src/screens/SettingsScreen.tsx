import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator, FlatList, Modal, Switch,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerIp, saveToken } from '../store/settingsSlice';
import { RootState } from '../store';
import { colors } from '../theme/colors';
import * as Network from 'expo-network';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_HEIGHT < 640;

interface FoundServer {
  ip: string;
  hostname: string;
}

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];

export const SettingsScreen = () => {
  const dispatch = useDispatch();
  const currentIp = useSelector((state: RootState) => state.settings.serverIp);
  const [ipInput, setIpInput] = useState(currentIp);

  const [scanning, setScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<FoundServer[]>([]);
  const [scanMessage, setScanMessage] = useState('');

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedServer, setSelectedServer] = useState<FoundServer | null>(null);
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<any>>();

  // ─── Numpad ────────────────────────────────────────────
  const onKey = useCallback((key: string) => {
    if (key === 'del') {
      setPin(p => p.slice(0, -1));
      setPinError('');
    } else if (key !== '' && pin.length < 4) {
      setPin(p => p + key);
      setPinError('');
    }
  }, [pin]);

  // ─── Network scan ──────────────────────────────────────
  const scanNetwork = async () => {
    setScanning(true);
    setFoundServers([]);
    setScanMessage('Ağ taranıyor...');
    try {
      const ip = await Network.getIpAddressAsync();
      if (!ip || ip === '0.0.0.0') {
        setScanMessage('Wi-Fi ağına bağlı değilsiniz.');
        setScanning(false);
        return;
      }
      const parts = ip.split('.');
      const subnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
      const found: FoundServer[] = [];
      const promises = [];
      for (let i = 1; i <= 254; i++) {
        const testIp = `${subnet}.${i}`;
        promises.push(
          axios.get(`http://${testIp}:3000/api/discovery`, { timeout: 1500 })
            .then(res => { if (res.data?.hostname) found.push({ ip: testIp, hostname: res.data.hostname }); })
            .catch(() => {})
        );
      }
      await Promise.all(promises);
      setFoundServers(found);
      setScanMessage(found.length === 0 ? 'Ağda açık sunucu bulunamadı.' : `${found.length} cihaz bulundu.`);
    } catch {
      setScanMessage('Tarama sırasında hata oluştu.');
    }
    setScanning(false);
  };

  const openPinModal = (server: FoundServer) => {
    setSelectedServer(server);
    setPin('');
    setPinError('');
    setLoading(false);
    setPinModalVisible(true);
  };

  const closePinModal = () => {
    setPin('');
    setPinError('');
    setPinModalVisible(false);
  };

  const handleConnect = async () => {
    if (!selectedServer || pin.length < 4 || loading) return;
    setLoading(true);
    setPinError('');
    try {
      const res = await axios.post(
        `http://${selectedServer.ip}:3000/api/verify_pin`, {},
        { timeout: 3000, headers: { 'X-Auth-PIN': pin } }
      );
      dispatch(saveToken({ ip: selectedServer.ip, token: res.data.token }));
      dispatch(setServerIp(selectedServer.ip));
      setIpInput(selectedServer.ip);
      setPinModalVisible(false);
      setPin('');
      setSuccessModalVisible(true);
    } catch (e: any) {
      setPin('');
      setPinError(e.response?.status === 401 ? 'Hatalı PIN!' : 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ayarlar</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Otomatik Ağ Taraması</Text>
        <TouchableOpacity style={[styles.button, styles.scanBtn]} onPress={scanNetwork} disabled={scanning}>
          {scanning
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="wifi-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>Cihaz Bul</Text>
              </>
          }
        </TouchableOpacity>

        {scanMessage !== '' && <Text style={styles.scanMsgText}>{scanMessage}</Text>}

        <FlatList
          data={foundServers}
          keyExtractor={item => item.ip}
          style={{ marginTop: 20, maxHeight: 200 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.serverItem} onPress={() => openPinModal(item)}>
              <Ionicons name="desktop-outline" size={22} color={colors.accent} />
              <Text style={styles.serverName}>{item.hostname}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </View>

      <Text style={styles.footerText}>Made by jesuisapres</Text>

      {/* ─── PIN MODALI ────────────────────────────── */}
      <Modal visible={pinModalVisible} transparent animationType="slide" onRequestClose={closePinModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Başlık */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedServer?.hostname}</Text>
              <Text style={styles.modalSubtitle}>PC ekranındaki 4 haneli kodu girin</Text>
            </View>

            {/* PIN kutuları */}
            <View style={styles.pinRow}>
              {[0,1,2,3].map(i => {
                const filled = i < pin.length;
                const active = i === pin.length;
                return (
                  <View key={i} style={[styles.pinBox, active && styles.pinBoxActive, filled && styles.pinBoxFilled]}>
                    {pin[i] ? <Text style={styles.pinDigit}>{pin[i]}</Text> : null}
                  </View>
                );
              })}
            </View>

            {/* Hata */}
            {pinError !== '' && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{pinError}</Text>
              </View>
            )}

            {/* Numpad */}
            <View style={styles.numpad}>
              {NUMPAD_KEYS.map((key, idx) => {
                if (key === '') return <View key={idx} style={styles.numpadKey} />;
                if (key === 'del') return (
                  <TouchableOpacity key={idx} style={styles.numpadKey} onPress={() => onKey('del')} activeOpacity={0.6}>
                    <Ionicons name="backspace-outline" size={IS_SMALL ? 22 : 26} color="#94A3B8" />
                  </TouchableOpacity>
                );
                return (
                  <TouchableOpacity key={key} style={styles.numpadKey} onPress={() => onKey(key)} activeOpacity={0.6}>
                    <Text style={styles.numpadDigit}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Beni hatırla */}
            <View style={styles.rememberRow}>
              <Text style={styles.rememberText}>Beni Hatırla</Text>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                thumbColor={colors.accent}
                trackColor={{ true: 'rgba(16,185,129,0.4)', false: '#334' }}
              />
            </View>

            {/* Butonlar */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closePinModal}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.connectBtn, (pin.length < 4 || loading) && styles.connectBtnDisabled]}
                onPress={handleConnect}
                disabled={pin.length < 4 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.connectBtnText}>Bağlan</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* ─── BAŞARI MODALI ────────────────────────── */}
      <Modal 
        visible={successModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalCard}>
            <Ionicons name="checkmark-circle" size={90} color="#10B981" style={{ alignSelf: 'center', marginBottom: 20 }} />
            <Text style={[styles.modalTitle, { color: '#10B981', fontSize: 28 }]}>Başarılı!</Text>
            <Text style={[styles.modalSubtitle, { fontSize: 16, marginTop: 8, marginBottom: 24 }]}>
              {selectedServer?.hostname} cihazına güvenli bağlantı kuruldu.
            </Text>
            
            <TouchableOpacity 
              style={styles.successBtn} 
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('Medya');
              }}>
              <Text style={styles.successBtnText}>Kullanmaya Başla</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 36,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  label: {
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scanBtn: {
    backgroundColor: colors.accent,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  scanMsgText: {
    color: colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  serverItem: {
    backgroundColor: 'rgba(16,185,129,0.05)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  serverName: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  footerText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 11,
    opacity: 0.4,
  },

  // ── Modal ─────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── PIN kutucukları ───────────────────────────
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinBox: {
    width: 58,
    height: IS_SMALL ? 50 : 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pinBoxActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  pinBoxFilled: {
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  pinDigit: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '700',
  },

  // ── Hata ─────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Numpad ────────────────────────────────────
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  numpadKey: {
    width: '33.33%',
    height: IS_SMALL ? 40 : 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadDigit: {
    color: '#E2E8F0',
    fontSize: IS_SMALL ? 20 : 24,
    fontWeight: '500',
  },

  // ── Beni Hatırla ──────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rememberText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '500',
  },

  // ── Aksiyon butonları ─────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 16,
  },
  connectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.accent,
    marginTop: IS_SMALL ? 0 : 0,
    elevation: 4,
  },
  connectBtnDisabled: {
    opacity: 0.35,
  },
  connectBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // ── Başarı Modalı ─────────────────────────────
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalCard: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  successBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  successBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  }
});
