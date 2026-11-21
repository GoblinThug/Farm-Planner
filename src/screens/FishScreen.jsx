import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { useActiveProfileSave } from '../context/ProfileContext';
import {
  seasons,
  UIIcon,
  SeasonIcon,
  fishSpriteAssets,
  fish,
  showValue,
  fishTimeDisplay,
  fishLevelDisplay,
  fishTypeLabel,
  fishSeasonText,
  fishLocationText,
  fishWeatherText,
  fishCatchMethodText,
  isLegendaryFish,
  isCrabPotFish,
  isNightMarketFish,
  isOtherCatch,
  fishSearchText,
} from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';

const FISH_CATEGORIES = ['Все', 'Удочка', 'Крабовые ловушки', 'Легендарные', 'Остров', 'Ночной рынок', 'Особый улов'];

export function FishScreen() {
  const { st, palette } = useTheme();
  const { ready, save, setSave } = useActiveProfileSave();
  const caughtFish = save.caughtFish;
  const setCaughtFish = updater =>
    setSave(current => ({
      ...current,
      caughtFish: typeof updater === 'function' ? updater(current.caughtFish) : updater,
    }));
  const [fishCategory, setFishCategory] = useState('Все');
  const [fishSearch, setFishSearch] = useState('');
  const [fishSeason, setFishSeason] = useState('Все сезоны');
  const [expandedFish, setExpandedFish] = useState(null);

  const fishSeasons = useMemo(() => [{ name: 'Все сезоны' }, ...seasons], []);

  const visibleFish = useMemo(
    () =>
      fish.filter(f => {
        const matchesCategory =
          fishCategory === 'Все' ||
          (fishCategory === 'Удочка' &&
            (f.catchMethod === 'fishingRod' ||
              f.type === 'regular' ||
              f.type === 'legendary' ||
              f.type === 'legendaryExtended')) ||
          (fishCategory === 'Крабовые ловушки' && isCrabPotFish(f)) ||
          (fishCategory === 'Легендарные' && isLegendaryFish(f)) ||
          (fishCategory === 'Остров' && fishLocationText(f).toLocaleLowerCase('ru').includes('джинджер')) ||
          (fishCategory === 'Ночной рынок' && isNightMarketFish(f)) ||
          (fishCategory === 'Особый улов' && isOtherCatch(f));
        const seasonList = Array.isArray(f.seasons)
          ? f.seasons
          : Array.isArray(f.season)
            ? f.season
            : String(f.season || '')
                .split(/[;,]/)
                .map(x => x.trim());
        const matchesSeason =
          fishSeason === 'Все сезоны' ||
          seasonList.includes(fishSeason) ||
          String(f.season || '')
            .toLocaleLowerCase('ru')
            .includes(fishSeason.toLocaleLowerCase('ru')) ||
          (fishSeason && Array.isArray(f.gingerIslandSeasons) && f.gingerIslandSeasons.includes(fishSeason));
        const matchesSearch = !fishSearch.trim() || fishSearchText(f).includes(fishSearch.trim().toLocaleLowerCase('ru'));
        return matchesCategory && matchesSeason && matchesSearch;
      }),
    [fishCategory, fishSeason, fishSearch]
  );

  if (!ready) {
    return (
      <Panel>
        <Text style={st.muted}>Загрузка списка рыб…</Text>
      </Panel>
    );
  }

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>СПРАВОЧНИК РЫБАКА</Text>
        <Text style={st.heroTitle}>
          <UIIcon name="fish" size={28} /> Рыбалка
        </Text>
        <Text style={st.heroSub}>Узнай, где и когда можно поймать каждую рыбу</Text>
        <Text style={st.beginnerHint}>
          Выбери сезон и способ ловли. В карточке сразу увидишь главное, а по нажатию откроются подробности.
        </Text>
      </Panel>
      <TextInput
        value={fishSearch}
        onChangeText={setFishSearch}
        placeholder="Найти рыбу или место..."
        placeholderTextColor={palette.muted}
        style={st.searchInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.fishFilterRow}>
        {FISH_CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            activeOpacity={0.85}
            onPress={() => setFishCategory(c)}
            style={[st.btn, st.fishCategoryBtn, fishCategory === c && st.btnOn]}
          >
            <Text numberOfLines={1} style={[st.btnText, fishCategory === c && st.btnTextOn]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={st.seasonRow}>
        {fishSeasons.map(s => (
          <TouchableOpacity
            key={s.name}
            activeOpacity={0.85}
            style={[st.btn, st.seasonBtn, fishSeason === s.name && st.btnOn]}
            onPress={() => setFishSeason(s.name)}
          >
            {s.name === 'Все сезоны' ? <UIIcon name="crops" size={24} /> : <SeasonIcon name={s.name} size={24} />}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[st.btnText, fishSeason === s.name && st.btnTextOn]}
            >
              {s.name === 'Все сезоны' ? 'Все' : s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={st.fishSummary}>
        <Text style={st.muted}>
          Найдено рыб: {visibleFish.length} · Поймано: {caughtFish.length} из {fish.length}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setFishCategory('Все');
            setFishSeason('Все сезоны');
            setFishSearch('');
          }}
        >
          <Text style={st.fishReset}>Сбросить фильтры</Text>
        </TouchableOpacity>
      </View>
      {visibleFish.map(f => {
        const isCaught = caughtFish.includes(f.name);
        const open = expandedFish === f.name;
        const price = f.basePrice ?? f.price;
        const notes = Array.isArray(f.availabilityNotes) ? f.availabilityNotes : [];
        const location = fishLocationText(f) || 'Место не указано';
        const seasonText = fishSeasonText(f) || 'Сезон не указан';
        const time = fishTimeDisplay(f.timeWindow ?? f.time);
        const weather = fishWeatherText(f);
        const detailRows = [
          ['Способ ловли', fishCatchMethodText(f)],
          ['Где искать', location],
          ['Сезон', seasonText],
          ['Время суток', time],
          ['Погода', weather],
          ['Уровень рыбалки', fishLevelDisplay(f.fishingLevelRequired ?? f.level)],
          ['Базовая цена', price == null ? null : `${price} з.`],
          ['Размер', f.sizeInches == null ? null : `${f.sizeInches} дюйм.`],
          ['Сложность', f.difficulty],
          ['Поведение', f.behavior],
          ['Опыт за поимку', f.baseXP],
        ];
        return (
          <TouchableOpacity activeOpacity={0.9} key={f.name} onPress={() => setExpandedFish(open ? null : f.name)}>
            <Panel style={[st.cropCard, isCaught && st.fishCardCaught]}>
              <View style={st.row}>
                <View style={st.fishThumb}>
                  {fishSpriteAssets[f.name] ? (
                    <Image source={fishSpriteAssets[f.name]} style={st.fishThumb} resizeMode="contain" />
                  ) : null}
                </View>
                <View style={st.flex1}>
                  <Text style={st.itemTitle}>{f.name}</Text>
                  <Text style={st.growingSummary}>
                    {fishTypeLabel(f)} · {fishCatchMethodText(f)}
                  </Text>
                  <Text style={st.detail}>Где: {location}</Text>
                  <Text style={st.detail}>
                    Когда: {seasonText}
                    {time ? ` · ${time}` : ''}
                  </Text>
                  {weather ? <Text style={st.detail}>Погода: {weather}</Text> : null}
                </View>
                <View style={st.fishCheckColumn}>
                  <TouchableOpacity
                    onPress={() => setCaughtFish(old => (isCaught ? old.filter(n => n !== f.name) : [...old, f.name]))}
                    style={[st.fishCheck, isCaught && st.fishCheckOn]}
                  >
                    <Text style={[st.fishCheckText, isCaught && st.fishCheckTextOn]}>{isCaught ? '✓' : '+'}</Text>
                  </TouchableOpacity>
                  <Text style={st.expandMark}>{open ? '−' : '+'}</Text>
                </View>
              </View>
              {open && (
                <View style={st.cropDetails}>
                  <Text style={st.detailSection}>Условия ловли</Text>
                  <View style={st.detailGrid}>
                    {detailRows
                      .filter(([, value]) => value !== null && value !== undefined && value !== '')
                      .map(([label, value]) => (
                        <View key={label} style={st.detailCell}>
                          <Text style={st.detailLabel}>{label}</Text>
                          <Text style={st.detailValue}>{showValue(value)}</Text>
                        </View>
                      ))}
                    {Array.isArray(f.gingerIslandSeasons) && f.gingerIslandSeasons.length > 0 ? (
                      <View style={st.detailCell}>
                        <Text style={st.detailLabel}>Сезон на Имбирном острове</Text>
                        <Text style={st.detailValue}>{showValue(f.gingerIslandSeasons)}</Text>
                      </View>
                    ) : null}
                  </View>
                  {f.requiresActiveQuest ? (
                    <Text style={st.simpleNote}>Доступна только во время задания мистера Ци «Расширенное семейство».</Text>
                  ) : null}
                  {notes.length > 0 ? (
                    <>
                      <Text style={st.detailSection}>Особые условия</Text>
                      <Text style={st.detailBody}>{notes.join(' ')}</Text>
                    </>
                  ) : null}
                  {isCrabPotFish(f) ? (
                    <Text style={st.simpleNote}>Поставь крабовую ловушку в воду, добавь наживку и проверь её на следующий день.</Text>
                  ) : null}
                  <Text style={st.detailNote}>Нажми на галочку, чтобы отметить рыбу как пойманную.</Text>
                </View>
              )}
              {!open ? <Text style={st.detailNote}>Нажми на карточку, чтобы открыть подробности</Text> : null}
            </Panel>
          </TouchableOpacity>
        );
      })}
      {visibleFish.length === 0 ? (
        <Panel>
          <Text style={st.muted}>Ничего не найдено. Попробуй изменить фильтры.</Text>
        </Panel>
      ) : null}
      <Panel>
        <Text style={st.panelTitle}>Как пользоваться справочником</Text>
        <Text style={st.detailBody}>• Выбери способ ловли и сезон, чтобы сократить список.</Text>
        <Text style={st.detailBody}>• В карточке смотри место, время суток и погоду.</Text>
        <Text style={st.detailBody}>• Нажми на карточку, чтобы открыть остальные условия.</Text>
        <Text style={st.detailBody}>• Нажми «+», чтобы отметить пойманную рыбу. Галочка означает, что она уже поймана.</Text>
        <Text style={st.detailBody}>
          • Волшебная наживка снимает обычные ограничения по сезону, времени и погоде, но не меняет место ловли.
        </Text>
        <Text style={st.detailBody}>• Крабовые ловушки проверяют на следующий день. Коптильня удваивает базовую цену рыбы.</Text>
      </Panel>
      <Text style={st.detailNote}>Цена указана без бонусов профессий и качества.</Text>
    </>
  );
}