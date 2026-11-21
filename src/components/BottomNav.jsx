import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UIIcon } from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { LEFT_TAB_IDS, RIGHT_TAB_IDS, tabById } from '../navigation/tabs';

const BOTTOM_TAB_IDS = new Set([...LEFT_TAB_IDS, ...RIGHT_TAB_IDS]);
/** Bottom padding under the nav bar (gesture/home area) */
export const NAV_BOTTOM_PAD = 15;
/** How far the menu button sticks above the top edge of the nav */
const MENU_PROTRUDE = 22;

function NavTab({ tabDef, active, onPress }) {
  const { st } = useTheme();
  if (!tabDef) return null;
  const iconEl =
    tabDef.icon === 'bundles' && tabDef.navIcon ? (
      <Image source={tabDef.navIcon} style={[st.navTabIcon, active && st.navTabIconActive]} resizeMode="contain" />
    ) : (
      <UIIcon name={tabDef.icon} size={22} />
    );
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[st.navItem, active && st.navItemActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tabDef.label}
      hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
    >
      {active ? <View style={st.navTabIndicator} /> : null}
      {iconEl}
      <Text
        style={[st.navText, active && st.navTextActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        ellipsizeMode="clip"
      >
        {tabDef.label}
      </Text>
    </TouchableOpacity>
  );
}

export function BottomNav({ activeTabId, onSelectTab, onOpenMenu }) {
  const { st, palette, isDark } = useTheme();
  const left = LEFT_TAB_IDS.map(id => tabById(id)).filter(Boolean);
  const right = RIGHT_TAB_IDS.map(id => tabById(id)).filter(Boolean);
  const menuSectionActive = activeTabId && !BOTTOM_TAB_IDS.has(activeTabId);

  return (
    <View style={[st.navWrap, { paddingBottom: NAV_BOTTOM_PAD }]}>
      <View style={st.nav}>
        <View style={st.navSide}>
          {left.map(t => (
            <NavTab key={t.id} tabDef={t} active={activeTabId === t.id} onPress={() => onSelectTab(t.id)} />
          ))}
        </View>

        <View style={st.navCenterSlot} pointerEvents="box-none">
          <TouchableOpacity
            onPress={onOpenMenu}
            style={[
              st.navMenuButton,
              menuSectionActive && st.navMenuButtonActive,
              {
                position: 'absolute',
                top: -MENU_PROTRUDE,
                zIndex: 70,
                elevation: 12,
              },
            ]}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityState={{ selected: menuSectionActive }}
            accessibilityLabel="Открыть меню разделов"
          >
            <Feather name="menu" size={22} color={isDark ? palette.cream : palette.ink} />
          </TouchableOpacity>
          <Text
            style={[
              st.navText,
              st.navMenuLabel,
              menuSectionActive && st.navTextActive,
              { marginTop: 0, marginBottom: 8 },
            ]}
          >
            Меню
          </Text>
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
