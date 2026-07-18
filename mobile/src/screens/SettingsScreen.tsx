import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Modal, Switch } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setServerIp, savePin } from '../store/settingsSlice';
import { RootState } from '../store';
import { colors } from '../theme/colors';
import * as Network from 'expo-network';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

interface FoundServer {
  ip: string;
  hostname: string;
}

export const SettingsScreen = () => {
  const dispatch = useDispatch();
  const currentIp = useSelector((state: RootState) => state.settings.serverIp);
  const savedPins = useSelector((state: RootState) => state.settings.savedPins);
  const [ipInput, setIpInput] = useState(currentIp);

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<FoundServer[]>([]);
  const [scanMessage, setScanMessage] = useState('');

  // PIN Modal state
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedServer, setSelectedServer] = useState<FoundServer | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [pinError, setPinError] = useState('');

  const handleSave = () => {
    dispatch(setServerIp(ipInput.trim()));
  };

  const scanNetwork = async () => {
    setScanning(true);
    setFoundServers([]);
    setScanMessage('Ağ taranıyor (Yaklaşık 2-3 saniye sürecek)...');
    try {
      const ip = await Network.getIpAddressAsync();
      if (!ip || ip === '0.0.0.0') {
        setScanMessage('Wi-Fi ağına bağlı değilsiniz.');
        setScanning(false);
        return;
      }

      const parts = ip.split('.');
      const subnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
      const promises = [];
      const found: FoundServer[] = [];

      for (let i = 1; i <= 254; i++) {
        const testIp = `${subnet}.${i}`;
        const p = axios.get(`http://${testIp}:3000/api/discovery`, { timeout: 1500 })
          .then(res => {
            if (res.data && res.data.hostname) {
              found.push({ ip: testIp, hostname: res.data.hostname });
            }
          })
          .catch(() => {});
        promises.push(p);
      }

      await Promise.all(promises);
      setFoundServers(found);
      if (found.length === 0) {
        setScanMessage('Ağda açık sunucu bulunamadı.');
      } else {
        setScanMessage(`${found.length} cihaz bulundu.`);
      }
    } catch (e) {
      console.error(e);
      setScanMessage('Tarama sırasında hata oluştu.');
    }
    setScanning(false);
  };

  const handleServerTap = (server: FoundServer) => {
    setSelectedServer(server);
    // Eğer daha önce kaydedilmiş bir PIN varsa, onu kullanabiliriz.
    // Ancak güvenlik için biz yine de soralım ya da doğrudan deneyelim.
    setPinInput(savedPins[server.ip] || '');
    setPinError('');
    setPinModalVisible(true);
  };

  const handlePinSubmit = async () => {
    if (!selectedServer) return;
    setPinError('');
    try {
      // PIN doğrulaması yap
      await axios.post(`http://${selectedServer.ip}:3000/api/verify_pin`, {}, {
        timeout: 2000,
        headers: { 'X-Auth-PIN': pinInput }
      });

      // Doğrulama başarılı
      if (rememberMe) {
        dispatch(savePin({ ip: selectedServer.ip, pin: pinInput }));
      }
      
      dispatch(setServerIp(selectedServer.ip));
      setIpInput(selectedServer.ip);
      setPinModalVisible(false);
    } catch (e: any) {
      if (e.response && e.response.status === 401) {
        setPinError('Hatalı PIN!');
      } else {
        setPinError('Bağlantı hatası.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ayarlar</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Otomatik Ağ Taraması</Text>
        <TouchableOpacity style={[styles.button, styles.scanBtn]} onPress={scanNetwork} disabled={scanning}>
          {scanning ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="wifi-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Cihaz Bul</Text>
            </>
          )}
        </TouchableOpacity>
        
        {scanMessage !== '' && <Text style={styles.scanMsgText}>{scanMessage}</Text>}

        <FlatList
          data={foundServers}
          keyExtractor={(item) => item.ip}
          style={{ marginTop: 24, maxHeight: 200 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.serverItem} onPress={() => handleServerTap(item)}>
              <Ionicons name="desktop-outline" size={24} color={colors.accent} />
              <Text style={styles.serverName}>{item.hostname}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      </View>
      
      <Text style={styles.footerText}>Made by jesuisapres</Text>

      {/* PIN Modalı */}
      <Modal visible={pinModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedServer?.hostname}</Text>
            <Text style={styles.modalSubtitle}>Bağlanmak için PC ekranındaki şifreyi girin</Text>
            
            <View style={styles.pinInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={pinInput}
                onChangeText={setPinInput}
                placeholder="0 0 0 0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="numeric"
                maxLength={4}
                autoFocus={true}
              />
            </View>

            <View style={styles.rememberRow}>
              <Text style={styles.rememberText}>Beni Hatırla</Text>
              <Switch value={rememberMe} onValueChange={setRememberMe} thumbColor={colors.accent} trackColor={{ true: 'rgba(16, 185, 129, 0.3)', false: '#333' }} />
            </View>

            {pinError !== '' && <Text style={styles.errorText}>{pinError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPinModalVisible(false)}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handlePinSubmit}>
                <Text style={styles.buttonText}>Bağlan</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 40,
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
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  scanBtn: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  scanMsgText: {
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  serverItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  serverName: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
    letterSpacing: 0.5,
  },
  statusText: {
    color: colors.accent,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    marginTop: 8,
    textAlign: 'center',
  },
  footerText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
  },
  pinInputContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  modalInput: {
    color: '#10B981',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 24,
    paddingVertical: 16,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 8,
  }
});
