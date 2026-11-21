import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import {
  seasons,
  UIIcon,
  SeasonIcon,
  CropIcon,
  cropDetails,
  showValue,
  cropSeasonList,
  cropGrowingPlaceLines,
  cropGrowingSummary,
} from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';
import { buildEncyclopediaCrops } from '../utils/encyclopediaCrops';

export function CropsScreen() {
  const { st, palette } = useTheme();
  const [filter, setFilter] = useState('Все');
  const [cropSearch, setCropSearch] = useState('');
  const [expandedCrop, setExpandedCrop] = useState(null);

  const encyclopediaCrops = useMemo(() => buildEncyclopediaCrops(), []);

  const seasonCrops = useMemo(() => {
    const bySeason =
      filter === 'Все'
        ? encyclopediaCrops
        : encyclopediaCrops.filter(c => {
            const farmSeasons = cropSeasonList(c.farmSeasons?.length ? c.farmSeasons : c.seasons);
            const canGrowOnFarm = farmSeasons.includes(filter);
            const canGrowOnIslandAllYear = (c.growingLocations || []).includes('gingerIsland');
            const hasNoFarmSeasonButIndoor =
              !(c.growingLocations || []).includes('farm') &&
              (c.growingLocations || []).some(location => ['greenhouse', 'indoorPot'].includes(location));
            return canGrowOnFarm || canGrowOnIslandAllYear || hasNoFarmSeasonButIndoor;
          });
    const q = cropSearch.trim().toLocaleLowerCase('ru');
    return q
      ? bySeason.filter(c => {
          const searchable = [c.name, c.id, ...(c.aliases || [])]
            .filter(Boolean)
            .join(' ')
            .toLocaleLowerCase('ru');
          return searchable.includes(q);
        })
      : bySeason;
  }, [filter, encyclopediaCrops, cropSearch]);

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>СПРАВОЧНИК ФЕРМЕРА</Text>
        <Text style={st.heroTitle}>
          <UIIcon name="crops" size={28} /> Культуры
        </Text>
        <Text style={st.heroSub}>Узнай, что посадить и где вырастить</Text>
        <Text style={st.beginnerHint}>
          Выбери сезон. В карточке каждой культуры сразу видно, где она растёт и в какое время года. Нажми на культуру, чтобы узнать цену семян и срок до урожая.
        </Text>
      </Panel>
      <TextInput
        value={cropSearch}
        onChangeText={setCropSearch}
        placeholder="Найти культуру..."
        placeholderTextColor={palette.muted}
        style={st.searchInput}
      />
      <View style={st.seasonRow}>
        {[{ name: 'Все' }, ...seasons].map(s => (
          <TouchableOpacity
            key={s.name}
            activeOpacity={0.85}
            style={[st.btn, st.seasonBtn, filter === s.name && st.btnOn]}
            onPress={() => setFilter(s.name)}
          >
            {s.name === 'Все' ? <UIIcon name="crops" size={24} /> : <SeasonIcon name={s.name} size={24} />}
            <Text numberOfLines={1} style={[st.btnText, filter === s.name && st.btnTextOn]}>
              {s.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={st.muted}>Для посадки в выбранный сезон (островные культуры доступны круглый год): {seasonCrops.length}</Text>
      {seasonCrops.map(c => {
        const d = cropDetails[c.name];
        const opened = expandedCrop === c.name;
        return (
          <TouchableOpacity activeOpacity={0.9} key={c.name} onPress={() => setExpandedCrop(opened ? null : c.name)}>
            <Panel style={st.cropCard}>
              <View style={st.row}>
                <CropIcon crop={c} size={46} />
                <View style={st.flex1}>
                  <Text style={st.itemTitle}>{c.name}</Text>
                  <Text style={st.growingSummary}>{cropGrowingSummary(c)}</Text>
                  <Text style={st.detail}>
                    {c.regrow ? `Первый урожай через ${c.days} дн. · затем каждые ${c.regrow} дн.` : `До урожая: ${c.days} дн.`}
                  </Text>
                </View>
                <Text style={st.expandMark}>{opened ? '−' : '+'}</Text>
              </View>
              {opened && (
                <View style={st.cropDetails}>
                  <Text style={st.detailSection}>Где можно выращивать</Text>
                  {cropGrowingPlaceLines(c).map((line, index) => (
                    <View key={`grow-${index}`} style={st.growingPlaceRow}>
                      <Text style={st.growingPlaceText}>{line}</Text>
                    </View>
                  ))}
                  <Text style={st.detailSection}>Что важно знать</Text>
                  <View style={st.detailGrid}>
                    {[
                      ['Семена', d ? `${showValue(d.seed)}${typeof d.seed === 'number' ? ' з.' : ''}` : null],
                      ['Где купить / найти', d?.source || null],
                      ['Цена продажи', d?.sell != null ? `${d.sell} з. за штуку` : null],
                      ['Первый урожай', c.days != null ? `${c.days} дней` : null],
                      ['Повторный урожай', c.regrow ? `Каждые ${c.regrow} дней` : 'Нет, собирается один раз'],
                      [
                        'Полив',
                        (c.requiresWatering ?? d?.requiresWatering) === true
                          ? 'Нужен каждый день'
                          : (c.requiresWatering ?? d?.requiresWatering) === false
                            ? 'Не требуется'
                            : null,
                      ],
                      ['Шпалера', (c.trellis ?? d?.trellis) === true ? 'Да - нельзя пройти сквозь растение' : null],
                      ['Опыт за сбор', d?.xp != null ? `${d.xp} опыта` : null],
                    ]
                      .filter(([, value]) => value !== null && value !== undefined)
                      .map(([label, value]) => (
                        <View key={label} style={st.detailCell}>
                          <Text style={st.detailLabel}>{label}</Text>
                          <Text style={st.detailValue}>{value}</Text>
                        </View>
                      ))}
                  </View>
                  {c.requiresActiveQuest || d?.requiresActiveQuest ? (
                    <Text style={st.simpleNote}>
                      Важно: доступна только во время задания «{showValue(c.requiresActiveQuest || d.requiresActiveQuest)}».
                    </Text>
                  ) : null}
                  {c.growingCondition || d?.growingCondition ? (
                    <Text style={st.simpleNote}>{showValue(c.growingCondition || d.growingCondition)}</Text>
                  ) : null}
                  {c.specialNotes || d?.specialNotes ? <Text style={st.simpleNote}>{showValue(c.specialNotes || d.specialNotes)}</Text> : null}
                  {c.harvestWindow || d?.harvestWindow ? (
                    <Text style={st.simpleNote}>Когда собирать: {showValue(c.harvestWindow || d.harvestWindow)}</Text>
                  ) : null}
                  {c.winterHarvestCondition || d?.winterHarvestCondition ? (
                    <Text style={st.simpleNote}>{showValue(c.winterHarvestCondition || d.winterHarvestCondition)}</Text>
                  ) : null}
                  {c.irrigatedGrowthDays || d?.irrigatedGrowthDays ? (
                    <Text style={st.simpleNote}>
                      Рядом с водой созревает быстрее: {showValue(c.irrigatedGrowthDays || d.irrigatedGrowthDays)} дней.
                    </Text>
                  ) : null}
                  {d?.use ? (
                    <>
                      <Text style={st.detailSection}>Для чего пригодится</Text>
                      <Text style={st.detailBody}>{showValue(d.use)}</Text>
                    </>
                  ) : null}
                  {d?.bundles ? (
                    <>
                      <Text style={st.detailSection}>Нужна для наборов</Text>
                      <Text style={st.detailBody}>{showValue(d.bundles)}</Text>
                    </>
                  ) : null}
                  <Text style={st.detailNote}>Источник: {c.wikiSource || d?.wikiSource || 'не указан'}</Text>
                </View>
              )}
            </Panel>
          </TouchableOpacity>
        );
      })}
      <Panel>
        <Text style={st.panelTitle}>Как читать карточки</Text>
        <Text style={st.detailBody}>• «Ферма» - можно сажать только в указанные сезоны.</Text>
        <Text style={st.detailBody}>• «Теплица» и «Имбирный остров» - можно выращивать в любое время года.</Text>
        <Text style={st.detailBody}>• «Горшок в помещении» - можно выращивать в горшке внутри дома или другого помещения.</Text>
        <Text style={st.detailBody}>
          • Срок роста указан в днях при ежедневном поливе. Если культура даёт повторный урожай, это тоже указано в карточке.
        </Text>
      </Panel>
    </>
  );
}