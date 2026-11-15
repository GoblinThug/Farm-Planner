import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UIIcon, palette } from '../data/appData';
import { st } from '../styles/styles';
import { LEFT_TAB_IDS, RIGHT_TAB_IDS, tabById } from '../navigation/tabs';

function NavTab({ tabDef, active, onPress }) {
  const iconEl =
    tabDef.icon === 'bundles' && tabDef.navIcon ? (
      <Image source={tabDef.navIcon} style={st.navTabIcon} resizeMode="contain" />
    ) : (
      <UIIcon name={tabDef.icon} size={23} />
    );
  return (
    <TouchableOpacity onPress={onPress} style={st.navItem} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      {iconEl}
      <Text style={[st.navText, active && st.navTextActive]} numberOfLines={1}>
        {tabDef.label}
      </Text>
    </TouchableOpacity>
  );
}

export function BottomNav({ activeTabId, onSelectTab, onOpenMenu }) {
  const left = LEFT_TAB_IDS.map(id => tabById(id));
  const right = RIGHT_TAB_IDS.map(id => tabById(id));
  return (
    <View style={st.navWrap}>
      <View style={st.nav}>
        <View style={st.navSide}>
          {left.map(t => (
            <NavTab key={t.id} tabDef={t} active={activeTabId === t.id} onPress={() => onSelectTab(t.id)} />
          ))}
        </View>
        <View style={st.navCenterSlot}>
          <TouchableOpacity
            onPress={onOpenMenu}
            style={st.navMenuButton}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Открыть меню разделов"
          >
            <Feather name="menu" size={24} color={palette.ink} />
          </TouchableOpacity>
          <Text style={st.navText}>Меню</Text>
        </View>
        <View style={st.navSide}>
          {right.map(t => (
            <NavTab key={t.id} tabDef={t} active={activeTabId === t.id} onPress={() => onSelectTab(t.id)} />
          ))}
        </View>
      </View>
    </View>
  );
}
