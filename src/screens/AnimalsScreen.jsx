import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import {
  UIIcon,
  animals,
  animalSpriteAssets,
  animalProductSpriteAssets,
  showValue,
  animalCategoryLabel,
  animalHousingLabel,
  animalPurchaseText,
  animalProduceSummary,
  animalSearchText,
} from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';

const ANIMAL_CATEGORIES = [
  { id: 'Все', label: 'Все' },
  { id: 'coop', label: 'Курятник' },
  { id: 'barn', label: 'Хлев' },
  { id: 'special', label: 'Особые' },
];

export function AnimalsScreen() {
  const { st, palette } = useTheme();
  const [category, setCategory] = useState('Все');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const visibleAnimals = useMemo(
    () =>
      animals.filter(a => {
        const matchesCategory = category === 'Все' || a.category === category || (category === 'special' && a.category === 'special');
        const q = search.trim().toLocaleLowerCase('ru');
        const matchesSearch = !q || animalSearchText(a).includes(q);
        return matchesCategory && matchesSearch;
      }),
    [category, search]
  );

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>СПРАВОЧНИК ФЕРМЕРА</Text>
        <Text style={st.heroTitle}>
          <UIIcon name="animals" size={28} /> Животные
        </Text>
        <Text style={st.heroSub}>Кто где живёт, что даёт и как часто</Text>
        <Text style={st.beginnerHint}>
          Фильтруй по курятнику или хлеву. На карточке — портрет животного; внутри перечислены дропы с иконками предметов, интервалы и советы.
        </Text>
      </Panel>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Найти животное или продукт..."
        placeholderTextColor={palette.muted}
        style={st.searchInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.fishFilterRow}>
        {ANIMAL_CATEGORIES.map(c => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.85}
            onPress={() => setCategory(c.id)}
            style={[st.btn, st.fishCategoryBtn, category === c.id && st.btnOn]}
          >
            <Text numberOfLines={1} style={[st.btnText, category === c.id && st.btnTextOn]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={st.fishSummary}>
        <Text style={st.muted}>В списке: {visibleAnimals.length} из {animals.length}</Text>
        <TouchableOpacity
          onPress={() => {
            setCategory('Все');
            setSearch('');
          }}
        >
          <Text style={st.fishReset}>Сбросить фильтры</Text>
        </TouchableOpacity>
      </View>
      {visibleAnimals.map(a => {
        const open = expanded === a.name;
        const purchase = animalPurchaseText(a);
        const products = Array.isArray(a.products) ? a.products : [];
        const detailRows = [
          ['Здание', animalHousingLabel(a)],
          ['Требования к постройке', a.buildingUpgrade],
          ['Как получить', purchase],
          ['Вылупление / инкубация', a.incubationDays],
          ['Кормление', a.feed],
          ['Как часто даёт продукт', a.produceInterval],
          ['Инструмент для сбора', a.toolRequired],
          ['Настроение', a.moodNotes],
          ['Профессии', a.professionNotes],
        ];
        return (
          <TouchableOpacity activeOpacity={0.9} key={a.name} onPress={() => setExpanded(open ? null : a.name)}>
            <Panel style={st.cropCard}>
              <View style={st.row}>
                <View style={st.fishThumb}>
                  {animalSpriteAssets[a.name] ? (
                    <Image source={animalSpriteAssets[a.name]} style={{ width: 46, height: 46 }} resizeMode="contain" />
                  ) : null}
                </View>
                <View style={st.flex1}>
                  <Text style={st.itemTitle}>{a.name}</Text>
                  <Text style={st.growingSummary}>
                    {animalCategoryLabel(a)} · {a.building}
                  </Text>
                  <Text style={st.detail}>{animalProduceSummary(a)}</Text>
                  {purchase ? <Text style={st.detail}>Покупка: {purchase}</Text> : null}
                </View>
                <Text style={st.expandMark}>{open ? '−' : '+'}</Text>
              </View>
              {open && (
                <View style={st.cropDetails}>
                  <Text style={st.detailSection}>Уход и содержание</Text>
                  <View style={st.detailGrid}>
                    {detailRows
                      .filter(([, value]) => value !== null && value !== undefined && value !== '')
                      .map(([label, value]) => (
                        <View key={label} style={st.detailCell}>
                          <Text style={st.detailLabel}>{label}</Text>
                          <Text style={st.detailValue}>{showValue(value)}</Text>
                        </View>
                      ))}
                  </View>
                  {products.length > 0 ? (
                    <>
                      <Text style={st.detailSection}>Продукты и цены (база, без качества и профессий)</Text>
                      {products.map((p, index) => (
                        <View key={`${p.name}-${index}`} style={[st.row, { alignItems: 'flex-start', marginBottom: 8 }]}>
                          <View style={st.fishThumb}>
                            {animalProductSpriteAssets[p.name] ? (
                              <Image source={animalProductSpriteAssets[p.name]} style={{ width: 40, height: 40 }} resizeMode="contain" />
                            ) : null}
                          </View>
                          <View style={st.flex1}>
                            <Text style={st.detailLabel}>{p.name}</Text>
                            <Text style={st.growingPlaceText}>
                              {p.basePrice != null ? `${p.basePrice} з.` : 'Цена не указана'}
                              {p.frequency ? ` · ${p.frequency}` : ''}
                              {p.condition ? `\n${p.condition}` : ''}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  ) : null}
                  {Array.isArray(a.specialNotes) && a.specialNotes.length > 0 ? (
                    <>
                      <Text style={st.detailSection}>Важно знать</Text>
                      {a.specialNotes.map((note, index) => (
                        <Text key={`note-${index}`} style={st.detailBody}>
                          • {note}
                        </Text>
                      ))}
                    </>
                  ) : null}
                  <Text style={st.detailNote}>Источник: {a.wikiSource || 'не указан'}</Text>
                </View>
              )}
              {!open ? <Text style={st.detailNote}>Нажми на карточку, чтобы открыть подробности</Text> : null}
            </Panel>
          </TouchableOpacity>
        );
      })}
      {visibleAnimals.length === 0 ? (
        <Panel>
          <Text style={st.muted}>Ничего не найдено. Попробуй изменить фильтры.</Text>
        </Panel>
      ) : null}
      <Panel>
        <Text style={st.panelTitle}>Как пользоваться справочником</Text>
        <Text style={st.detailBody}>• «Курятник» — птицы и кролик; нужны улучшения для уток и кроликов.</Text>
        <Text style={st.detailBody}>• «Хлев» — коровы, козы, овцы и свиньи; свинья только в Роскошном хлеву.</Text>
        <Text style={st.detailBody}>• Настроение ≥ 150 и корм нужны почти всем, кроме слизней в отдельном хлеву.</Text>
        <Text style={st.detailBody}>• Коров и коз доят ведром, овец стригут ножницами; свиньи ищут трюфели на траве.</Text>
        <Text style={st.detailBody}>• Вместимость: 4 / 8 / 12 животных на уровне постройки (базовая / улучшенная / роскошная).</Text>
      </Panel>
      <Text style={st.detailNote}>Цены продажи указаны без звёзд качества и бонусов профессий.</Text>
    </>
  );
}