import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import {
  palette,
  bundlesData,
  bundleImageAssets,
  bundleRoomImages,
  bundleItemIcons,
  bundleNavIcon,
  bundleRooms,
  bundleColors,
  bundleCardTints,
} from '../data/appData';
import { st } from '../styles/styles';
import { Panel } from '../components/Panel';

export function BundlesScreen() {
  const [bundleSearch, setBundleSearch] = useState('');
  const [bundleVariant, setBundleVariant] = useState('standard');
  const [bundleRoom, setBundleRoom] = useState('Все');
  const [expandedBundle, setExpandedBundle] = useState(null);

  const sourceBundles = bundleVariant === 'standard' ? bundlesData.standardBundles : bundlesData.remixedBundles;
  const visibleBundles = useMemo(
    () =>
      sourceBundles.filter(
        b =>
          (bundleRoom === 'Все' || b.room === bundleRoom) &&
          `${b.name} ${bundleRooms.find(r => r.id === b.room)?.name || ''} ${b.items.map(i => i.name).join(' ')}`
            .toLowerCase()
            .includes(bundleSearch.toLowerCase())
      ),
    [sourceBundles, bundleRoom, bundleSearch]
  );
  const visibleRoomGroups = useMemo(
    () =>
      bundleRooms
        .map(room => ({ ...room, bundles: visibleBundles.filter(b => b.room === room.id) }))
        .filter(room => room.bundles.length > 0),
    [visibleBundles]
  );

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>СПРАВОЧНИК ЦЕНТРА СООБЩЕСТВА</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={bundleNavIcon} style={{ width: 30, height: 30 }} resizeMode="contain" />
          <Text style={st.heroTitle}>Узелки</Text>
        </View>
        <Text style={st.heroSub}>Что собрать, где найти и как завершить наборы</Text>
        <Text style={st.beginnerHint}>
          Открой набор, чтобы посмотреть все необходимые предметы, способы получения, сезоны и награду. Стандартные и перемешанные наборы разделены.
        </Text>
      </Panel>
      <TextInput
        value={bundleSearch}
        onChangeText={setBundleSearch}
        placeholder="Найти набор или предмет..."
        placeholderTextColor={palette.muted}
        style={st.searchInput}
      />
      <View style={st.bundleModeRow}>
        <TouchableOpacity
          onPress={() => {
            setBundleVariant('standard');
            setExpandedBundle(null);
          }}
          style={[st.btn, st.bundleModeBtn, bundleVariant === 'standard' && st.btnOn]}
        >
          <Text style={st.btnText}>Обычные наборы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setBundleVariant('remixed');
            setExpandedBundle(null);
          }}
          style={[st.btn, st.bundleModeBtn, bundleVariant === 'remixed' && st.btnOn]}
        >
          <Text style={st.btnText}>Перемешанные</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.bundleRoomTabs}>
        <TouchableOpacity
          onPress={() => setBundleRoom('Все')}
          style={[st.bundleRoomTab, bundleRoom === 'Все' && st.bundleRoomTabActive]}
        >
          <Image source={bundleNavIcon} style={st.bundleRoomIcon} resizeMode="contain" />
          <Text style={st.bundleRoomTabText}>Все</Text>
        </TouchableOpacity>
        {bundleRooms.map(r => (
          <TouchableOpacity
            key={r.id}
            onPress={() => {
              setBundleRoom(r.id);
              setExpandedBundle(null);
            }}
            style={[st.bundleRoomTab, bundleRoom === r.id && st.bundleRoomTabActive]}
          >
            <Image source={bundleRoomImages[r.id]} style={st.bundleRoomIcon} resizeMode="cover" />
            <Text numberOfLines={2} style={st.bundleRoomTabText}>
              {r.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={st.muted}>Найдено наборов: {visibleBundles.length}</Text>
      {visibleRoomGroups.map(group => (
        <View key={group.id} style={st.bundleRoomSection}>
          <View style={st.bundleRoomHeading}>
            <Image source={bundleRoomImages[group.id]} style={st.bundleRoomHeadingImage} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={st.panelTitle}>{group.name}</Text>
              <Text style={st.detail}>{group.bundles.length} наборов</Text>
            </View>
          </View>
          {group.bundles.map(b => {
            const opened = expandedBundle === b.id;
            const room = group;
            const colorIndex = b.color?.index;
            const color = colorIndex == null ? '#b99a6c' : bundleColors[colorIndex] || '#b99a6c';
            const bundleIcon =
              bundleImageAssets[b.id] || (b.room === 'abandoned-joja-mart' ? bundleImageAssets['missing-bundle'] : null);
            return (
              <TouchableOpacity key={b.id} activeOpacity={0.9} onPress={() => setExpandedBundle(opened ? null : b.id)}>
                <Panel
                  style={[
                    st.cropCard,
                    {
                      backgroundColor: bundleCardTints[colorIndex] || 'rgba(185,154,108,0.12)',
                      borderWidth: 1,
                      borderColor: 'rgba(120,88,53,0.22)',
                      borderLeftWidth: 4,
                      borderLeftColor: color,
                      marginTop: 0,
                      marginBottom: 10,
                      padding: 12,
                    },
                  ]}
                >
                  <View style={st.row}>
                    {bundleIcon ? (
                      <Image source={bundleIcon} style={st.bundleWikiIcon} resizeMode="contain" />
                    ) : (
                      <View style={[st.bundleSack, { backgroundColor: color, borderColor: palette.wood }]}>
                        <View style={st.bundleKnot} />
                        <View style={st.bundleSackFold} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={st.itemTitle}>{b.name}</Text>
                      <Text style={st.growingSummary}>
                        {room?.name || 'Центр сообщества'} · {b.itemsRequired} из {b.items.length} предметов
                      </Text>
                      <Text style={st.detail}>
                        {b.color?.name ? `Цвет узелка: ${b.color.name}` : 'Цвет узелка для этого варианта не указан'}
                      </Text>
                    </View>
                    <Text style={st.expandMark}>{opened ? '−' : '+'}</Text>
                  </View>
                  {opened && (
                    <View style={st.cropDetails}>
                      <Text style={st.detailSection}>Что нужно собрать</Text>
                      {b.items.map((it, i) => (
                        <View key={`${b.id}-${i}`} style={st.bundleItem}>
                          <Image source={bundleItemIcons[it.name]} style={st.bundleItemIcon} resizeMode="contain" />
                          <View style={{ flex: 1 }}>
                            <Text style={st.itemTitle}>
                              {it.name}
                              {it.quantity > 1 ? ` × ${it.quantity}` : ''}
                            </Text>
                            {it.minimumQuality ? <Text style={st.detail}>Качество: {it.minimumQuality}</Text> : null}
                            {it.seasons?.length ? <Text style={st.detail}>Сезон: {it.seasons.join(', ')}</Text> : null}
                            {it.methods?.length ? <Text style={st.detail}>Как получить: {it.methods.join('; ')}</Text> : null}
                            {it.locations?.length ? <Text style={st.detail}>Где найти: {it.locations.join('; ')}</Text> : null}
                            {it.time ? <Text style={st.detail}>Время: {it.time}</Text> : null}
                            {it.weather ? <Text style={st.detail}>Погода: {it.weather}</Text> : null}
                            {it.notes ? <Text style={st.simpleNote}>{it.notes}</Text> : null}
                          </View>
                        </View>
                      ))}
                      <Text style={st.detailSection}>Условия завершения</Text>
                      <Text style={st.detailBody}>
                        {b.selectionMode === 'choose'
                          ? `Нужно выбрать ${b.itemsRequired} предмета(ов) из списка.`
                          : `Нужно сдать все ${b.itemsRequired} предмета(ов).`}
                      </Text>
                      {b.notes ? <Text style={st.simpleNote}>{Array.isArray(b.notes) ? b.notes.join(' ') : b.notes}</Text> : null}
                      {b.reward ? (
                        <>
                          <Text style={st.detailSection}>Награда</Text>
                          <Text style={st.detailBody}>
                            {b.reward.name}
                            {b.reward.quantity ? ` × ${b.reward.quantity}` : ''}
                          </Text>
                        </>
                      ) : null}
                      <Text style={st.detailNote}>
                        Цвет и требования показаны по данным справочника. Для перемешанных вариантов цвет может быть неизвестен.
                      </Text>
                    </View>
                  )}
                </Panel>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {visibleBundles.length === 0 ? (
        <Panel>
          <Text style={st.muted}>Ничего не найдено. Измени запрос или фильтр комнаты.</Text>
        </Panel>
      ) : null}
      <Panel>
        <Text style={st.panelTitle}>Как пользоваться справочником</Text>
        <Text style={st.detailBody}>• Выбери обычные или перемешанные наборы в зависимости от настроек новой игры.</Text>
        <Text style={st.detailBody}>• Фильтр по комнате помогает найти нужный раздел Центра сообщества.</Text>
        <Text style={st.detailBody}>• Открой карточку, чтобы увидеть количество, качество и способы получения каждого предмета.</Text>
      </Panel>
    </>
  );
}