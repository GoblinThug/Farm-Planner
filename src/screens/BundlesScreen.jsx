import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import {
  bundlesData,
  bundleImageAssets,
  bundleRoomImages,
  bundleItemIcons,
  bundleNavIcon,
  bundleRooms,
  bundleColors,
  bundleCardTints,
} from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';
import { useActiveProfileSave } from '../context/ProfileContext';

function itemKey(variant, bundleId, index) {
  return `${variant}:${bundleId}:${index}`;
}

export function BundlesScreen() {
  const { st, palette, isDark } = useTheme();
  const { ready, save, setSave } = useActiveProfileSave();
  const tracker = save.bundleTracker;
  const [bundleSearch, setBundleSearch] = useState('');
  const [bundleVariant, setBundleVariant] = useState(tracker.variant || 'standard');
  const [bundleRoom, setBundleRoom] = useState('Все');
  const [expandedBundle, setExpandedBundle] = useState(null);

  const patchTracker = updater =>
    setSave(current => ({
      ...current,
      bundleTracker: typeof updater === 'function' ? updater(current.bundleTracker) : { ...current.bundleTracker, ...updater },
    }));

  const setVariant = v => {
    setBundleVariant(v);
    patchTracker(t => ({ ...t, variant: v }));
    setExpandedBundle(null);
  };

  const toggleItem = (bundleId, index) => {
    const key = itemKey(bundleVariant, bundleId, index);
    patchTracker(t => {
      const next = { ...t.checkedItems };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { ...t, checkedItems: next };
    });
  };

  const toggleBundleComplete = bundleId => {
    const key = `${bundleVariant}:${bundleId}`;
    patchTracker(t => {
      const next = { ...t.completedBundles };
      if (next[key]) delete next[key];
      else next[key] = true;
      return { ...t, completedBundles: next };
    });
  };

  const setBundleNote = (bundleId, text) => {
    const key = `${bundleVariant}:${bundleId}`;
    patchTracker(t => ({
      ...t,
      bundleNotes: { ...t.bundleNotes, [key]: text },
    }));
  };

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

  const stats = useMemo(() => {
    let checked = 0;
    let total = 0;
    let completed = 0;
    for (const b of sourceBundles) {
      total += b.items.length;
      b.items.forEach((_, i) => {
        if (tracker.checkedItems[itemKey(bundleVariant, b.id, i)]) checked += 1;
      });
      if (tracker.completedBundles[`${bundleVariant}:${b.id}`]) completed += 1;
    }
    return { checked, total, completed, bundleCount: sourceBundles.length };
  }, [sourceBundles, tracker, bundleVariant]);

  if (!ready) {
    return (
      <Panel>
        <Text style={st.muted}>Загрузка…</Text>
      </Panel>
    );
  }

  return (
    <>
      <Panel style={st.hero}>
        <Text style={st.eyebrow}>СПРАВОЧНИК ЦЕНТРА СООБЩЕСТВА</Text>
        <View style={st.rowHeader}>
          <Image source={bundleNavIcon} style={st.heroInlineIcon} resizeMode="contain" />
          <Text style={st.heroTitle}>Узелки</Text>
        </View>
        <Text style={st.heroSub}>Что собрать, где найти и как завершить наборы</Text>
        <Text style={st.beginnerHint}>
          Отмечай предметы и целые наборы — прогресс сохраняется в текущем профиле фермы. Открой карточку для справки и заметок.
        </Text>
        <View style={st.fishProgress}>
          <View style={[st.fishProgressFill, { width: `${stats.total ? (stats.checked / stats.total) * 100 : 0}%` }]} />
        </View>
        <Text style={st.heroProgressText}>
          Предметов: {stats.checked} / {stats.total} · Наборов: {stats.completed} / {stats.bundleCount}
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
          onPress={() => setVariant('standard')}
          style={[st.btn, st.bundleModeBtn, bundleVariant === 'standard' && st.btnOn]}
        >
          <Text style={[st.btnText, bundleVariant === 'standard' && st.btnTextOn]}>Обычные наборы</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setVariant('remixed')}
          style={[st.btn, st.bundleModeBtn, bundleVariant === 'remixed' && st.btnOn]}
        >
          <Text style={[st.btnText, bundleVariant === 'remixed' && st.btnTextOn]}>Перемешанные</Text>
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
            <View style={st.flex1}>
              <Text style={st.panelTitle}>{group.name}</Text>
              <Text style={st.detail}>{group.bundles.length} наборов</Text>
            </View>
          </View>
          {group.bundles.map(b => {
            const opened = expandedBundle === b.id;
            const bundleComplete = !!tracker.completedBundles[`${bundleVariant}:${b.id}`];
            const room = group;
            const colorIndex = b.color?.index;
            const color = colorIndex == null ? '#b99a6c' : bundleColors[colorIndex] || '#b99a6c';
            const bundleIcon =
              bundleImageAssets[b.id] || (b.room === 'abandoned-joja-mart' ? bundleImageAssets['missing-bundle'] : null);
            const doneCount = b.items.filter((_, i) => tracker.checkedItems[itemKey(bundleVariant, b.id, i)]).length;
            return (
              <TouchableOpacity key={b.id} activeOpacity={0.9} onPress={() => setExpandedBundle(opened ? null : b.id)}>
                <Panel
                  style={[
                    st.cropCard,
                    bundleComplete && st.fishCardCaught,
                    {
                      backgroundColor: isDark
                        ? palette.paperSoft
                        : bundleCardTints[colorIndex] || 'rgba(185,154,108,0.12)',
                      borderWidth: 1,
                      borderColor: isDark ? palette.lineSoft : 'rgba(120,88,53,0.22)',
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
                    <View style={st.flex1}>
                      <Text style={st.itemTitle}>{b.name}</Text>
                      <Text style={st.growingSummary}>
                        {room?.name || 'Центр сообщества'} · {doneCount} / {b.items.length} предметов
                        {b.itemsRequired !== b.items.length ? ` (нужно ${b.itemsRequired})` : ''}
                      </Text>
                      <Text style={st.detail}>
                        {b.color?.name ? `Цвет узелка: ${b.color.name}` : 'Цвет узелка для этого варианта не указан'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={e => {
                        e?.stopPropagation?.();
                        toggleBundleComplete(b.id);
                      }}
                      style={[st.fishCheck, st.bundleTrackerCheck, { marginLeft: 8 }, bundleComplete && st.fishCheckOn]}
                    >
                      <Text style={[st.fishCheckText, bundleComplete && st.fishCheckTextOn]}>{bundleComplete ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                  </View>
                  {opened && (
                    <View style={st.cropDetails}>
                      <Text style={st.detailSection}>Что нужно собрать</Text>
                      {b.items.map((it, i) => {
                        const on = !!tracker.checkedItems[itemKey(bundleVariant, b.id, i)];
                        return (
                          <View key={`${b.id}-${i}`} style={st.bundleTrackerItem}>
                            <TouchableOpacity
                              onPress={() => toggleItem(b.id, i)}
                              style={[st.fishCheck, st.bundleTrackerCheck, on && st.fishCheckOn]}
                            >
                              <Text style={[st.fishCheckText, on && st.fishCheckTextOn]}>{on ? '✓' : '+'}</Text>
                            </TouchableOpacity>
                            <Image source={bundleItemIcons[it.name]} style={st.bundleItemIcon} resizeMode="contain" />
                            <View style={st.flex1}>
                              <Text style={[st.itemTitle, on && { textDecorationLine: 'line-through', opacity: 0.75 }]}>
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
                        );
                      })}
                      <Text style={st.detailSection}>Заметка</Text>
                      <TextInput
                        value={tracker.bundleNotes[`${bundleVariant}:${b.id}`] || ''}
                        onChangeText={t => setBundleNote(b.id, t)}
                        placeholder="Что осталось найти, где хранишь предметы..."
                        placeholderTextColor={palette.muted}
                        style={st.searchInput}
                        multiline
                      />
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
        <Text style={st.panelTitle}>Как пользоваться</Text>
        <Text style={st.detailBody}>• «+» у набора — весь узелок сдан; у предмета — отдельная позиция собрана.</Text>
        <Text style={st.detailBody}>• Выбери обычные или перемешанные наборы в зависимости от настроек игры.</Text>
        <Text style={st.detailBody}>• Фильтр по комнате помогает найти нужный раздел Центра сообщества.</Text>
      </Panel>
    </>
  );
}