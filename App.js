import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { layout, space } from './src/styles/tokens';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SCREENS_BY_TAB_ID } from './src/screens';
import { BottomNav, NAV_BOTTOM_PAD } from './src/components/BottomNav';
import { NavMenuModal } from './src/components/NavMenuModal';
import { ProfileMenuModal } from './src/components/ProfileMenuModal';
import { SettingsModal } from './src/components/SettingsModal';
import { UpdatePrompt } from './src/components/UpdatePrompt';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ScreenTransition } from './src/components/ScreenTransition';

function AppBody() {
  const [activeTabId, setActiveTabId] = useState('calendar');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activeProfileId, activeProfile } = useProfile();
  const { st, palette, isDark } = useTheme();

  const Screen = SCREENS_BY_TAB_ID[activeTabId] || SCREENS_BY_TAB_ID.calendar;

  return (
    <SafeAreaView style={st.safe} edges={['top', 'left', 'right']}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.paper}
      />
      <UpdatePrompt />
      <View style={st.top}>
        <View style={st.brandBlock}>
          <Text style={st.brand}>FARM PLANNER</Text>
          <Text style={st.brandSub}>ТВОЙ СЕЗОННЫЙ ПОМОЩНИК</Text>
          {activeProfile?.name ? <Text style={st.profileNameChip}>{activeProfile.name}</Text> : null}
        </View>
        <View style={st.topActions}>
          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Настройки"
            activeOpacity={0.85}
            style={st.headerIconButton}
          >
            <Feather name="settings" size={20} color={palette.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setProfileOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Профиль и настройки данных"
            activeOpacity={0.85}
            style={st.profileButton}
          >
            <Image source={require('./assets/profile/farmer.png')} style={st.farmerPortrait} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={st.main}>
        <ScrollView
          style={st.mainScroll}
          contentContainerStyle={[
            st.content,
            { paddingBottom: layout.navMinHeight + space.xxl + NAV_BOTTOM_PAD },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenTransition transitionKey={`${activeTabId}-${activeProfileId}-${isDark ? 'dark' : 'light'}`}>
            <Screen />
          </ScreenTransition>
          <Text style={st.footer}>FARM PLANNER · STARDEW VALLEY COMPANION</Text>
        </ScrollView>
        <BottomNav activeTabId={activeTabId} onSelectTab={setActiveTabId} onOpenMenu={() => setMenuOpen(true)} />
      </View>
      <NavMenuModal
        visible={menuOpen}
        activeTabId={activeTabId}
        onClose={() => setMenuOpen(false)}
        onSelectTab={setActiveTabId}
      />
      <ProfileMenuModal visible={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ProfileProvider>
          <AppBody />
        </ProfileProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
