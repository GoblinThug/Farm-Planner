import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UIIcon, palette } from '../data/appData';
import { st } from '../styles/styles';
import { APP_TABS } from '../navigation/tabs';

export function NavMenuModal({ visible, activeTabId, onClose, onSelectTab }) {
  const select = id => {
    onSelectTab(id);
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.modalBackdrop}>
        <View style={st.navMenuCard}>
          <View style={st.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={st.modalEyebrow}>НАВИГАЦИЯ</Text>
              <Text style={st.navMenuTitle}>Разделы приложения</Text>
              <Text style={st.modalIntro}>Те же страницы, что и в нижней панели — удобно на большом экране или одной рукой.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={st.closeButton} accessibilityLabel="Закрыть меню">
              <UIIcon name="close" size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView style={st.navMenuList} showsVerticalScrollIndicator={false}>
            {APP_TABS.map(tab => {
              const active = activeTabId === tab.id;
              const iconEl =
                tab.icon === 'bundles' && tab.navIcon ? (
                  <Image source={tab.navIcon} style={st.navMenuRowIcon} resizeMode="contain" />
                ) : (
                  <UIIcon name={tab.icon} size={28} />
                );
              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.85}
                  onPress={() => select(tab.id)}
                  style={[st.navMenuRow, active && st.navMenuRowActive]}
                >
                  <View style={st.navMenuRowIconWrap}>{iconEl}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.navMenuRowTitle}>{tab.label}</Text>
                    {active ? <Text style={st.navMenuRowHint}>Сейчас открыто</Text> : null}
                  </View>
                  {active ? <Feather name="check" size={20} color={palette.greenDark} /> : <Feather name="chevron-right" size={20} color={palette.muted} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={st.cancelButton}>
            <Text style={st.cancelText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}