import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { AnimatedModal } from './AnimatedModal';
import { Feather } from '@expo/vector-icons';
import { UIIcon } from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { APP_TABS } from '../navigation/tabs';
import { MENU_EXTRA_TABS } from '../navigation/menuExtras';

export function NavMenuModal({ visible, activeTabId, onClose, onSelectTab }) {
  const { st, palette } = useTheme();
  const select = id => {
    onSelectTab(id);
    onClose();
  };
  return (
    <AnimatedModal visible={visible} onRequestClose={onClose} cardStyle={st.navMenuCard}>
          <View style={st.modalHeader}>
            <View style={st.flex1}>
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
              const iconEl = tab.navIcon ? (
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
                  <View style={st.flex1}>
                    <Text style={st.navMenuRowTitle}>{tab.label}</Text>
                    {active ? <Text style={st.navMenuRowHint}>Сейчас открыто</Text> : null}
                  </View>
                  {active ? <Feather name="check" size={20} color={palette.greenDark} /> : <Feather name="chevron-right" size={20} color={palette.muted} />}
                </TouchableOpacity>
              );
            })}
            <Text style={[st.modalEyebrow, st.sectionEyebrow]}>ДОПОЛНИТЕЛЬНО</Text>
            {MENU_EXTRA_TABS.map(tab => {
              const active = activeTabId === tab.id;
              const iconEl = tab.navIcon ? (
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
                  <View style={st.flex1}>
                    <Text style={st.navMenuRowTitle}>{tab.label}</Text>
                    {tab.hint ? <Text style={st.navMenuRowHint}>{tab.hint}</Text> : null}
                  </View>
                  {active ? <Feather name="check" size={20} color={palette.greenDark} /> : <Feather name="chevron-right" size={20} color={palette.muted} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={st.cancelButton}>
            <Text style={st.cancelText}>Закрыть</Text>
          </TouchableOpacity>
    </AnimatedModal>
  );
}