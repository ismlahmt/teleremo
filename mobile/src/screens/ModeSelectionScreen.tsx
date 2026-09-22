import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Linking, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { setAppMode } from '../store/settingsSlice';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const GITHUB_RELEASES_URL = 'https://github.com/ismlahmt/teleremo/releases/latest';

export const ModeSelectionScreen = () => {
  const dispatch = useDispatch();
  const [infoVisible, setInfoVisible] = useState(false);

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

      {/* PC Kurulumu Bilgi Butonu */}
      <TouchableOpacity style={styles.infoBtn} onPress={() => setInfoVisible(true)} activeOpacity={0.7}>
        <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
        <Text style={styles.infoBtnText}>PC için sunucu nasıl kurulur?</Text>
      </TouchableOpacity>

      {/* ─── BİLGİ MODALI ─────────────────────────────── */}
      <Modal visible={infoVisible} transparent animationType="slide" onRequestClose={() => setInfoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandleBar} />

            <View style={styles.modalHeader}>
              <Ionicons name="desktop-outline" size={36} color={colors.accent} style={{ marginBottom: 12 }} />
              <Text style={styles.modalTitle}>PC Sunucusu Kurulumu</Text>
              <Text style={styles.modalSubtitle}>
                Telefonu PC'ye bağlamak için bilgisayarınıza{'\n'}Teleremo sunucusunu kurmanız gerekiyor.
              </Text>
            </View>

            <ScrollView style={styles.stepsScroll} showsVerticalScrollIndicator={false}>
              {[
                { num: '1', icon: 'logo-github', text: 'GitHub sayfasına gidin ve "Teleremo Setup" dosyasını indirin.' },
                { num: '2', icon: 'download-outline', text: 'İndirilen .exe dosyasını çalıştırın ve kurulumu tamamlayın.' },
                { num: '3', icon: 'checkmark-circle-outline', text: 'Kurulum sonrası uygulama otomatik açılır ve sağ altta görev çubuğuna yerleşir.' },
                { num: '4', icon: 'wifi-outline', text: 'Telefonunuzu ve PC\'nizi aynı Wi-Fi ağına bağlayın.' },
                { num: '5', icon: 'link-outline', text: 'Bu uygulamada "PC\'ye Bağlan" seçeneğine girin ve "Cihaz Bul" ile bilgisayarınızı tarayın.' },
              ].map((step) => (
                <View key={step.num} style={styles.stepRow}>
                  <View style={styles.stepNumBadge}>
                    <Text style={styles.stepNum}>{step.num}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.githubBtn}
              onPress={() => Linking.openURL(GITHUB_RELEASES_URL)}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-github" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.githubBtnText}>GitHub'dan İndir</Text>
              <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closeBtnText}>Kapat</Text>
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

  // ── Bilgi Butonu ─────────────────────────────
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 10,
    gap: 6,
  },
  infoBtnText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
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
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    maxHeight: '90%',
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Adımlar ───────────────────────────────────
  stepsScroll: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNum: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  // ── GitHub Butonu ─────────────────────────────
  githubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 4,
  },
  githubBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // ── Kapat ─────────────────────────────────────
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
});

