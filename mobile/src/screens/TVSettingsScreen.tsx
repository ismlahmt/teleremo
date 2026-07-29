import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity,
  ActivityIndicator, FlatList, Modal, TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTvIp } from '../store/settingsSlice';
import { RootState } from '../store';
import { colors } from '../theme/colors';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { tvClient } from '../api/tvClient';

interface FoundTV {
  ip: string;
  name: string;
}

export const TVSettingsScreen = () => {
  const dispatch = useDispatch();
  const currentTvIp = useSelector((state: RootState) => state.settings.tvIp);
  
  const [scanning, setScanning] = useState(false);
  const [foundTVs, setFoundTVs] = useState<FoundTV[]>([]);
  const [scanMessage, setScanMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [selectedTV, setSelectedTV] = useState<FoundTV | null>(null);
  const [manualIp, setManualIp] = useState('');

  const navigation = useNavigation<NavigationProp<any>>();

  const fetchWithTimeout = (url: string, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
      fetch(url)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const scanNetwork = async () => {
    setScanning(true);
    setFoundTVs([]);
    setScanMessage('Ağ taranıyor (SSDP ile)...');
    
    try {
      const ip = await Network.getIpAddressAsync();
      if (!ip || ip === '0.0.0.0') {
        setScanMessage('Wi-Fi ağına bağlı değilsiniz.');
        setScanning(false);
        return;
      }
      
      const socket = require('react-native-udp').default.createSocket({ type: 'udp4', reuseAddress: true });
      const { Buffer } = require('buffer');
      const found: FoundTV[] = [];

      socket.bind(0, '0.0.0.0', () => {
        try {
          const searchMessage = Buffer.from(
            'M-SEARCH * HTTP/1.1\r\n' +
            'HOST: 239.255.255.250:1900\r\n' +
            'MAN: "ssdp:discover"\r\n' +
            'MX: 3\r\n' +
            'ST: ssdp:all\r\n' +
            '\r\n'
          );

          socket.send(searchMessage, 0, searchMessage.length, 1900, '239.255.255.250');
          socket.send(searchMessage, 0, searchMessage.length, 1900, '255.255.255.255');
        } catch (e) {
          console.warn('UDP Send error:', e);
        }
      });

      socket.on('message', (msg: any, rinfo: any) => {
        const response = msg.toString();
        if (response.includes('HTTP/1.1 200 OK') && rinfo.address !== ip) {
          const foundIp = rinfo.address;
          
          if (!found.find(t => t.ip === foundIp)) {
            found.push({ ip: foundIp, name: '...' });
            
            fetchWithTimeout(`http://${foundIp}:8001/api/v2/`, 1500)
              .then((res: any) => res.json())
              .then((data: any) => {
                if (data && data.name) {
                  setFoundTVs(prev => {
                    const filtered = prev.filter(t => t.ip !== foundIp);
                    const updated = [...filtered, { ip: foundIp, name: data.name }];
                    setScanMessage(`${updated.length} cihaz bulundu.`);
                    return updated;
                  });
                }
              })
              .catch(() => {
                // Kapsamlı Smart TV, TV Box ve Yayın Cihazı Filtresi
                // "TV" kelimesi geçmese bile markalardan, işletim sistemlerinden veya medya protokollerinden (MediaRenderer, DIAL) cihazın TV olduğunu anlar.
                const tvRegex = /tv|tizen|webos|bravia|roku|dial|mediarenderer|vizio|samsung|chromecast|google\s?cast|fire\s?os|fire\s?stick|shield|mi\s?box|hisense|vidaa|panasonic|viera|philips|tcl|xbox|playstation|android/i;
                const isTvHint = tvRegex.test(response);
                
                setFoundTVs(prev => {
                  const filtered = prev.filter(t => t.ip !== foundIp);
                  if (isTvHint) {
                    const updated = [...filtered, { ip: foundIp, name: `Smart TV (${foundIp})` }];
                    setScanMessage(`${updated.length} cihaz bulundu.`);
                    return updated;
                  }
                  // TV değilse (modem, akıllı priz vb.) listeye eklemeden çıkar
                  return filtered;
                });
              });
          }
        }
      });

      socket.on('error', (err: any) => {
        console.warn('UDP Socket Error:', err);
      });

      setTimeout(() => {
        try {
          socket.close();
        } catch(e){}
        setScanning(false);
        setFoundTVs(prev => {
          if (prev.length === 0) setScanMessage('Ağda TV bulunamadı.');
          return prev;
        });
      }, 4000);

    } catch (error) {
      setScanMessage('Tarama başlatılamadı.');
      setScanning(false);
    }
  };

  const handleConnect = (tv: FoundTV) => {
    setLoading(true);
    setSelectedTV(tv);
    
    // Test connection
    tvClient.connect(
      tv.ip,
      () => {
        setLoading(false);
        dispatch(setTvIp(tv.ip));
        setSuccessModalVisible(true);
      },
      () => {
        setLoading(false);
        setErrorModalVisible(true);
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>TV Bağlantısı</Text>
      
      {currentTvIp ? (
        <View style={styles.currentIpCard}>
          <Text style={styles.currentIpLabel}>Kayıtlı TV IP:</Text>
          <Text style={styles.currentIpText}>{currentTvIp}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Otomatik Ağ Taraması</Text>
        <TouchableOpacity style={[styles.button, styles.scanBtn]} onPress={scanNetwork} disabled={scanning}>
          {scanning
            ? <ActivityIndicator color="#fff" />
            : <>
                <Ionicons name="search-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.buttonText}>TV Bul</Text>
              </>
          }
        </TouchableOpacity>

        {scanMessage !== '' && <Text style={styles.scanMsgText}>{scanMessage}</Text>}

        <FlatList
          data={foundTVs}
          keyExtractor={item => item.ip}
          style={{ marginTop: 20, maxHeight: 180 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.serverItem} 
              onPress={() => handleConnect(item)}
              disabled={loading}
            >
              <Ionicons name="tv-outline" size={24} color={colors.accent} />
              <View style={styles.serverInfo}>
                <Text style={styles.serverName}>{item.name}</Text>
                <Text style={styles.serverIp}>{item.ip}</Text>
              </View>
              {loading && selectedTV?.ip === item.ip ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <Ionicons name="link-outline" size={22} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          )}
        />
        <View style={styles.manualIpContainer}>
          <Text style={styles.label}>Manuel IP Girişi</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <TextInput
                style={{ color: colors.text, height: 48 }}
                placeholder="Örn: 192.168.1.100"
                placeholderTextColor={colors.textMuted}
                value={manualIp}
                onChangeText={setManualIp}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity 
              style={[styles.button, { paddingHorizontal: 20 }]} 
              onPress={() => handleConnect({ ip: manualIp, name: 'Bilinmeyen TV' })}
              disabled={loading || manualIp.length < 7}
            >
              <Text style={styles.buttonText}>Bağlan</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>

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
              {selectedTV?.name} cihazına güvenli bağlantı kuruldu.
            </Text>
            
            <TouchableOpacity 
              style={styles.successBtn} 
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('TV Kumanda');
              }}>
              <Text style={styles.successBtnText}>Kullanmaya Başla</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── HATA MODALI ────────────────────────── */}
      <Modal 
        visible={errorModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalCard, { borderColor: '#EF4444' }]}>
            <Ionicons name="close-circle" size={90} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 20 }} />
            <Text style={[styles.modalTitle, { color: '#EF4444', fontSize: 28 }]}>Bağlantı Başarısız</Text>
            <Text style={[styles.modalSubtitle, { fontSize: 16, marginTop: 8, marginBottom: 24, textAlign: 'center' }]}>
              Televizyona ulaşılamadı. Aynı Wi-Fi ağına bağlı olduğunuzdan emin olun. Eğer TV ekranında izin penceresi çıkarsa lütfen "İzin Ver"i seçin.
            </Text>
            
            <TouchableOpacity 
              style={[styles.successBtn, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]} 
              onPress={() => setErrorModalVisible(false)}>
              <Text style={styles.successBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cihaz Değiştirme Butonu */}
      <TouchableOpacity 
        style={styles.switchDeviceBtn} 
        onPress={() => {
           import('../store/settingsSlice').then(module => {
             dispatch(module.setAppMode(null));
           });
        }}
      >
        <Ionicons name="swap-horizontal" size={20} color={colors.textMuted} />
        <Text style={styles.switchDeviceBtnText}>Farklı Bir Cihaza Geç (PC / TV)</Text>
      </TouchableOpacity>

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
    marginBottom: 24,
  },
  currentIpCard: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  currentIpLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginRight: 8,
  },
  currentIpText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  serverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  serverName: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  serverIp: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  
  manualIpContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // ── Modal ─────────────────────────────────────
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
  successBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
  },
  successBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  switchDeviceBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    padding: 12,
  },
  switchDeviceBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  }
});

