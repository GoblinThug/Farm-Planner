import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';
import { formatVillagerBirthday, getVillagers, MARRIAGEABLE_VILLAGERS, villagerSearchText } from '../data/villagers';
import { villagerPortraitSprites, bundleItemIcons } from '../assets/sprites';
import { SeasonIcon } from '../data/appData';

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'marriage', label: 'Женитьба' },
  { id: 'Весна', label: 'Весна' },
  { id: 'Лето', label: 'Лето' },
  { id: 'Осень', label: 'Осень' },
  { id: 'Зима', label: 'Зима' },
];

export function VillagersScreen() {
  const { st, palette } = useTheme();
  const villagers = useMemo(() => getVillagers(), []);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('ru');
    return villagers.filter(v => {
      if (q && !villagerSearchText(v).includes(q)) return false;
      if (filter === 'marriage' && !MARRIAGEABLE_VILLAGERS.has(v.name)) return false;
      if (['Весна', 'Лето', 'Осень', 'Зима'].includes(filter) && v.birthday?.season !== filter) return false;
      return true;
    });
  }, [villagers, search, filter]);

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>ГОРОД ПЕЛИКАН</Text>
        <Text style={st.heroTitle}>
          {villagerPortraitSprites.lewis ? (
            <Image source={villagerPortraitSprites.lewis} style={{ width: 28, height: 28 }} resizeMode="contain" />
          ) : null}{' '}
          Персонажи
        </Text>
        <Text style={st.heroSub}>Портреты, дни рождения и лучшие подарки жителей долины</Text>
        <Text style={st.beginnerHint}>
          Нажми на карточку, чтобы раскрыть список подарков. Фильтр «Женитьба» — только кандидаты в супруги.
        </Text>
      </Panel>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Найти по имени, сезону или подарку..."
        placeholderTextColor={palette.muted}
        style={st.searchInput}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.fishFilterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.85}
            onPress={() => setFilter(f.id)}
            style={[
              st.btn,
              st.fishCategoryBtn,
              filter === f.id && st.btnOn,
              ['Весна', 'Лето', 'Осень', 'Зима'].includes(f.id) && { flexDirection: 'row', gap: 4 },
            ]}
          >
            {['Весна', 'Лето', 'Осень', 'Зима'].includes(f.id) ? (
              <SeasonIcon name={f.id} size={18} />
            ) : null}
            <Text numberOfLines={1} style={[st.btnText, filter === f.id && st.btnTextOn]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={st.fishSummary}>
        <Text style={st.muted}>
          В списке: {visible.length} из {villagers.length}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setFilter('all');
            setSearch('');
          }}
        >
          <Text style={st.fishReset}>Сбросить фильтры</Text>
        </TouchableOpacity>
      </View>

      {visible.map(v => {
        const open = expanded === v.name;
        const portrait = v.id ? villagerPortraitSprites[v.id] : null;
        const lovesPreview = v.loves.slice(0, 3).join(' · ');
        const moreGifts = v.loves.length > 3 ? ` +${v.loves.length - 3}` : '';

        return (
          <TouchableOpacity activeOpacity={0.9} key={v.name} onPress={() => setExpanded(open ? null : v.name)}>
            <Panel style={st.cropCard}>
              <View style={st.row}>
                <View style={st.fishThumb}>
                  {portrait ? (
                    <Image source={portrait} style={{ width: 46, height: 46 }} resizeMode="contain" />
                  ) : (
                    <View style={[st.birthdayPortrait, st.birthdayPortraitPlaceholder, { width: 46, height: 46 }]}>
                      <Text style={st.birthdayPortraitInitial}>{v.name.charAt(0)}</Text>
                    </View>
                  )}
                </View>
                <View style={st.flex1}>
                  <Text style={st.itemTitle}>{v.name}</Text>
                  <Text style={st.growingSummary}>
                    {formatVillagerBirthday(v)}
                    {v.marriageable ? ' · Можно жениться' : ''}
                  </Text>
                  {v.loves.length > 0 ? (
                    <Text style={st.detail} numberOfLines={open ? undefined : 2}>
                      Лучшие подарки: {lovesPreview}
                      {moreGifts}
                    </Text>
                  ) : (
                    <Text style={st.muted}>Нет данных о подарках</Text>
                  )}
                </View>
                <Text style={st.expandMark}>{open ? '−' : '+'}</Text>
              </View>

              {open && (
                <View style={st.cropDetails}>
                  {v.birthday ? (
                    <View style={st.detailGrid}>
                      <View style={st.detailCell}>
                        <Text style={st.detailLabel}>День рождения</Text>
                        <Text style={st.detailValue}>
                          {v.birthday.season}, {v.birthday.day} число
                        </Text>
                      </View>
                      <View style={st.detailCell}>
                        <Text style={st.detailLabel}>Отношения</Text>
                        <Text style={st.detailValue}>{v.marriageable ? 'Можно выйти замуж / жениться' : 'Дружба'}</Text>
                      </View>
                    </View>
                  ) : null}

                  {v.loves.length > 0 ? (
                    <>
                      <Text style={st.detailSection}>Лучшие подарки (с вики)</Text>
                      <View style={st.birthdayGiftList}>
                        {v.loves.map(gift => {
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
                    </>
                  ) : (
                    <Text style={st.muted}>Нет данных о любимых подарках.</Text>
                  )}
                </View>
              )}

              {!open ? <Text style={st.detailNote}>Нажми на карточку, чтобы открыть подробности</Text> : null}
            </Panel>
          </TouchableOpacity>
        );
      })}

      {visible.length === 0 ? (
        <Panel>
          <Text style={st.muted}>Никого не нашли. Попробуй другой запрос или фильтр.</Text>
        </Panel>
      ) : null}

      <Panel>
        <Text style={st.panelTitle}>Подсказка</Text>
        <Text style={st.detailBody}>• Подарки в день рождения дают в 8 раз больше очков дружбы.</Text>
        <Text style={st.detailBody}>• Список подарков совпадает с блоком «лучшие подарки» на русской вики.</Text>
        <Text style={st.detailBody}>• Дни рождения также отмечены в разделе «События и дни рождения» в календаре.</Text>
      </Panel>
    </>
  );
}