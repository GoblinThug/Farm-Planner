import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { palette } from './src/data/appData';
import { st } from './src/styles/styles';
import { SCREENS_BY_TAB_ID } from './src/screens';
import { BottomNav } from './src/components/BottomNav';
import { NavMenuModal } from './src/components/NavMenuModal';

export default function App() {
  const [activeTabId, setActiveTabId] = useState('calendar');
  const [menuOpen, setMenuOpen] = useState(false);

  const Screen = SCREENS_BY_TAB_ID[activeTabId] || SCREENS_BY_TAB_ID.calendar;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={st.safe}>
        <ExpoStatusBar style="dark" />
        <StatusBar barStyle="dark-content" backgroundColor={palette.paper} />
        <View style={st.top}>
          <View style={st.brandBlock}>
            <Text style={st.brand}>FARM PLANNER</Text>
            <Text style={st.brandSub}>ТВОЙ СЕЗОННЫЙ ПОМОЩНИК</Text>
          </View>
          <Image source={require('./assets/profile/farmer.png')} style={st.farmerPortrait} resizeMode="contain" />
        </View>
        <View style={st.main}>
          <ScrollView style={st.mainScroll} contentContainerStyle={st.content} keyboardShouldPersistTaps="handled">
            <Screen />
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}