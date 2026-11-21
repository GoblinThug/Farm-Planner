import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getVillagerGifts } from '../data/villagerGifts';
import { villagerPortraitSprites, bundleItemIcons } from '../assets/sprites';

export function BirthdayGiftCard({ name }) {
  const { st } = useTheme();
  const info = getVillagerGifts(name);
  const portrait = info?.id ? villagerPortraitSprites[info.id] : null;
  const loves = info?.loves || [];

  return (
    <View style={st.birthdayCard}>
      <View style={st.birthdayCardHeader}>
        {portrait ? (
          <Image source={portrait} style={st.birthdayPortrait} resizeMode="contain" />
        ) : (
          <View style={[st.birthdayPortrait, st.birthdayPortraitPlaceholder]}>
            <Text style={st.birthdayPortraitInitial}>{name?.charAt(0) || '?'}</Text>
          </View>
        )}
        <View style={st.flex1}>
          <Text style={st.birthdayName}>{name}</Text>
          <Text style={st.muted}>День рождения · любимые подарки</Text>
        </View>
      </View>
      {loves.length > 0 ? (
        <View style={st.birthdayGiftList}>
          {loves.map(gift => {
            const icon = bundleItemIcons[gift];
            return (
              <View key={gift} style={st.birthdayGiftRow}>
                {icon ? (
                  <Image source={icon} style={st.birthdayGiftIcon} resizeMode="contain" />
                ) : (
                  <View style={[st.birthdayGiftIcon, st.birthdayGiftIconEmpty]} />
                )}
                <Text style={st.birthdayGiftText}>{gift}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={st.muted}>Нет данных о любимых подарках.</Text>
      )}
    </View>
  );
}