import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import {
  palette,
  seasons,
  week,
  UIIcon,
  SeasonIcon,
  CropIcon,
  addDays,
  dateText,
} from '../data/appData';
import { seasonThemes, st } from '../styles/styles';
import { Panel } from '../components/Panel';
import { buildEncyclopediaCrops } from '../utils/encyclopediaCrops';
import { computeAllEvents } from '../utils/plantingEvents';

const LOCATION_LABELS = {
  farm: 'Ферма',
  greenhouse: 'Теплица',
  gingerIsland: 'Имбирный остров',
  indoorPot: 'Горшок в помещении',
};

export function CalendarScreen() {
  const [season, setSeason] = useState('Весна');
  const [day, setDay] = useState(1);
  const [year, setYear] = useState(1);
  const [plantings, setPlantings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dayModal, setDayModal] = useState(false);
  const [modalSelected, setModalSelected] = useState([]);
  const [modalCropSearch, setModalCropSearch] = useState('');
  const [plantingLocation, setPlantingLocation] = useState('farm');
  const [irrigated, setIrrigated] = useState(false);
  const [qiQuestActive, setQiQuestActive] = useState(false);

  const encyclopediaCrops = useMemo(() => buildEncyclopediaCrops(), []);

  useEffect(() => {
    AsyncStorage.getItem('farm-plantings-v1')
      .then(v => {
        if (v) {
          const loadedPlantings = JSON.parse(v).map(p => ({ ...p, year: p.year || 1 }));
          setPlantings(loadedPlantings);
          const order = { Весна: 0, Лето: 1, Осень: 2, Зима: 3 };
          const latest = [...loadedPlantings].sort(
            (a, b) => (b.year - a.year) || (order[b.season] - order[a.season]) || (b.day - a.day)
          )[0];
          if (latest) {
            setYear(latest.year);
            setSeason(latest.season);
            setDay(latest.day);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem('farm-plantings-v1', JSON.stringify(plantings)).catch(() =>
        Alert.alert('Не удалось сохранить', 'Проверь доступность хранилища устройства.')
      );
    }
  }, [plantings, loaded]);

  const modalCrops = useMemo(
    () =>
      encyclopediaCrops.filter(c => {
        const locations = c.growingLocations || ['farm', 'greenhouse'];
        if (!locations.includes(plantingLocation)) return false;
        if (c.requiresActiveQuest && !qiQuestActive) return false;
        if (plantingLocation === 'farm' && !(c.farmSeasons || []).includes(season)) return false;
        return true;
      }),
    [encyclopediaCrops, season, plantingLocation, qiQuestActive]
  );

  const visibleModalCrops = useMemo(() => {
    const query = modalCropSearch.trim().toLocaleLowerCase('ru');
    if (!query) return modalCrops;
    return modalCrops.filter(
      c =>
        c.name.toLocaleLowerCase('ru').includes(query) ||
        String(c.id || '')
          .toLocaleLowerCase('ru')
          .includes(query)
    );
  }, [modalCrops, modalCropSearch]);

  const toggleModalCrop = name =>
    setModalSelected(old => (old.includes(name) ? old.filter(x => x !== name) : [...old, name]));

  const addModalPlantings = () => {
    const dayCropNames = new Set(modalCrops.map(c => c.name));
    setPlantings(old => {
      const kept = old.filter(
        p =>
          !(
            p.year === year &&
            p.season === season &&
            p.day === day &&
            p.location === plantingLocation &&
            dayCropNames.has(p.crop)
          )
      );
      const entries = modalSelected.map(name => {
        const previous = old.find(
          p =>
            p.year === year &&
            p.season === season &&
            p.day === day &&
            p.crop === name &&
            (p.location || 'farm') === plantingLocation
        );
        return previous
          ? { ...previous, irrigated: !!irrigated, qiQuestActive: !!qiQuestActive }
          : {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`,
              crop: name,
              season,
              day,
              year,
              quantity: 1,
              location: plantingLocation,
              irrigated: !!irrigated,
              qiQuestActive: !!qiQuestActive,
            };
      });
      return [...kept, ...entries];
    });
    setModalSelected([]);
    setDayModal(false);
  };

  const allEvents = useMemo(() => computeAllEvents(plantings, encyclopediaCrops), [plantings, encyclopediaCrops]);
  const dayEvents = allEvents.filter(e => e.year === year && e.season === season && e.day === day);

  const openDayModal = () => {
    setPlantingLocation('farm');
    setModalCropSearch('');
    setIrrigated(
      plantings.some(
        p =>
          (p.year || 1) === year &&
          p.season === season &&
          p.day === day &&
          (p.location || 'farm') === 'farm' &&
          p.irrigated
      )
    );
    setQiQuestActive(
      plantings.some(p => (p.year || 1) === year && p.season === season && p.day === day && p.qiQuestActive)
    );
    setModalSelected([
      ...new Set(
        plantings
          .filter(
            p =>
              (p.year || 1) === year &&
              p.season === season &&
              p.day === day &&
              (p.location || 'farm') === 'farm'
          )
          .map(p => p.crop)
      ),
    ]);
    setDayModal(true);
  };

  return (
    <>
      <Panel style={[st.hero, seasonThemes[season]?.panel]}>
        <Text style={st.eyebrow}>ВАША ФЕРМА • ПЛАНИРОВЩИК</Text>
        <Text style={st.heroTitle}>
          <SeasonIcon name={season} size={30} /> {season.toUpperCase()}
        </Text>
        <Text style={st.heroSub}>Планируй посадки и заранее смотри, когда собирать урожай.</Text>
        <Text style={st.beginnerHint}>
          Выбери день в календаре и нажми «Запланировать посадку». Приложение само отметит посадку и будущие сборы.
        </Text>
        <View style={st.yearSelector}>
          <TouchableOpacity onPress={() => setYear(y => Math.max(1, y - 1))} style={st.yearArrow}>
            <Text style={st.yearArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={st.yearLabel}>ГОД {year}</Text>
          <TouchableOpacity onPress={() => setYear(y => y + 1)} style={st.yearArrow}>
            <Text style={st.yearArrowText}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={st.seasonRow}>
          {seasons.map(s => (
            <TouchableOpacity
              key={s.name}
              activeOpacity={0.85}
              style={[
                st.btn,
                st.seasonBtn,
                st.calendarSeasonBtn,
                season === s.name && [st.btnOn, seasonThemes[season]?.selected],
              ]}
              onPress={() => {
                if (season === 'Зима' && s.name === 'Весна') setYear(y => y + 1);
                setSeason(s.name);
                setDay(1);
              }}
            >
              <SeasonIcon name={s.name} size={24} />
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={st.btnText}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Panel>
      <Panel>
        <Text style={st.panelTitle}>Календарь сезона · 28 дней</Text>
        <View style={st.calendar}>
          {week.map(w => (
            <Text key={w} style={st.week}>
              {w}
            </Text>
          ))}
          {Array.from({ length: 28 }, (_, i) => i + 1).map(n => {
            const ev = allEvents.filter(e => e.year === year && e.season === season && e.day === n);
            const hasPlant = ev.some(e => e.kind === 'Посадка');
            const hasHarvest = ev.some(e => e.kind !== 'Посадка');
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setDay(n)}
                style={[st.day, hasPlant && st.dayHasPlant, hasHarvest && st.dayHasHarvest, day === n && st.dayOn]}
              >
                <Text style={[st.dayNum, day === n && st.white]}>{n}</Text>
                {(hasPlant || hasHarvest) && (
                  <View style={st.dayMarkers}>
                    {hasPlant && <View style={[st.dayMarker, st.plantMarker]} />}
                    {hasHarvest && <View style={[st.dayMarker, st.harvestMarker]} />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={st.calendarLegend}>
          <View style={st.legendItem}>
            <View style={[st.dayMarker, st.plantMarker]} />
            <Text style={st.legendText}>Посадка</Text>
          </View>
          <View style={st.legendItem}>
            <View style={[st.dayMarker, st.harvestMarker]} />
            <Text style={st.legendText}>Сбор урожая</Text>
          </View>
        </View>
        <View style={st.selected}>
          <View style={st.selectedDateRow}>
            <Text style={st.bigDay}>{day}</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.itemTitle}>{dateText({ season, day, year })}</Text>
              <Text style={st.muted}>
                {dayEvents.length
                  ? `${dayEvents.filter(e => e.kind === 'Посадка').length} посадок · ${dayEvents.filter(e => e.kind !== 'Посадка').length} сборов`
                  : 'На этот день пока ничего не запланировано'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={openDayModal} style={st.dayAddButton}>
            <UIIcon name="plus" size={18} />
            <Text style={st.dayAddText}>Запланировать посадку</Text>
          </TouchableOpacity>
        </View>
      </Panel>
      <Text style={st.heading}>Что происходит в этот день</Text>
      {dayEvents.length ? (
        dayEvents.map((e, i) => (
          <Panel
            key={`${e.p.id || i}-${e.kind}-${i}`}
            style={[st.eventCard, e.kind === 'Посадка' ? st.plantEventCard : st.harvestEventCard]}
          >
            <CropIcon crop={e.c} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={st.eventKind}>{e.kind === 'Посадка' ? 'ПОСАДИТЬ' : 'ПОРА СОБИРАТЬ'}</Text>
              <Text style={st.itemTitle}>{e.c.name}</Text>
              <Text style={st.muted}>
                {e.p.quantity || 1} шт. · {LOCATION_LABELS[e.p.location || 'farm']}
              </Text>
              {e.kind !== 'Посадка' && (
                <Text style={st.detail}>
                  Посажено: {dateText({ season: e.p.season, day: e.p.day, year: e.p.year || 1 })}
                </Text>
              )}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Удалить посадку ${e.c.name}`}
              onPress={() => setDeleteTarget(e.p)}
              style={st.deletePlantButton}
            >
              <Feather name="trash-2" size={16} color="#8b3e2f" />
            </TouchableOpacity>
          </Panel>
        ))
      ) : (
        <Panel>
          <Text style={st.muted}>На этот день событий нет. Выбери другой день или запланируй новую посадку.</Text>
        </Panel>
      )}

      <Modal visible={dayModal} transparent animationType="fade" onRequestClose={() => setDayModal(false)}>
        <View style={st.modalBackdrop}>
          <View style={st.modalCard}>
            <View style={st.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={st.modalEyebrow}>НОВАЯ ПОСАДКА</Text>
                <Text style={st.modalTitle}>
                  <SeasonIcon name={season} size={24} /> {day} день · {season.toLowerCase()}
                </Text>
                <Text style={st.modalIntro}>
                  Сначала выбери место, затем отметь культуры. Мы покажем примерную дату первого урожая.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDayModal(false)} style={st.closeButton}>
                <UIIcon name="close" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={st.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={st.modalSectionTitle}>1. Где будешь сажать?</Text>
              <View style={st.locationGrid}>
                {[
                  ['farm', 'Ферма', 'Только культуры этого сезона'],
                  ['greenhouse', 'Теплица', 'Можно выращивать круглый год'],
                  ['gingerIsland', 'Имбирный остров', 'Можно выращивать круглый год'],
                  ['indoorPot', 'Горшок в помещении', 'Для культур, которым подходит горшок'],
                ].map(([key, label, description]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      setPlantingLocation(key);
                      setModalSelected([]);
                      setModalCropSearch('');
                    }}
                    style={[st.locationOption, plantingLocation === key && st.locationOptionActive]}
                  >
                    <View style={[st.locationRadio, plantingLocation === key && st.locationRadioActive]}>
                      {plantingLocation === key && <View style={st.locationRadioDot} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.locationTitle}>{label}</Text>
                      <Text style={st.locationDescription}>{description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {(plantingLocation === 'farm' || plantingLocation === 'gingerIsland') && (
                <View style={st.optionsBox}>
                  <Text style={st.optionsTitle}>Особые условия</Text>
                  <TouchableOpacity onPress={() => setIrrigated(v => !v)} style={st.optionToggle}>
                    <View style={[st.checkCircle, irrigated && st.checkCircleOn]}>
                      {irrigated && <Text style={st.checkMark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.itemTitle}>Рядом есть вода</Text>
                      <Text style={st.muted}>Для риса и корня таро рост будет быстрее</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              <View style={st.optionsBox}>
                <Text style={st.optionsTitle}>Задание «Урожай Ки»</Text>
                <TouchableOpacity onPress={() => setQiQuestActive(v => !v)} style={st.optionToggle}>
                  <View style={[st.checkCircle, qiQuestActive && st.checkCircleOn]}>
                    {qiQuestActive && <Text style={st.checkMark}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.itemTitle}>Я выполняю это задание</Text>
                    <Text style={st.muted}>Включи, если выращиваешь специальные культуры для задания</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={st.cropPickerHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={st.modalSectionTitle}>2. Какие культуры посадить?</Text>
                  <Text style={st.muted}>
                    Доступно: {modalCrops.length} · Выбрано: {modalSelected.length}
                  </Text>
                </View>
              </View>
              <TextInput
                value={modalCropSearch}
                onChangeText={setModalCropSearch}
                placeholder="Найти культуру..."
                placeholderTextColor={palette.muted}
                style={st.modalSearch}
              />
              {visibleModalCrops.map((c, i) => {
                const selected = modalSelected.includes(c.name);
                const selectedGrowthDays = irrigated && c.irrigatedGrowthDays ? c.irrigatedGrowthDays : c.days;
                const harvest = addDays(season, day, selectedGrowthDays, year);
                const harvestAllowed = plantingLocation !== 'farm' || (c.farmSeasons || []).includes(harvest.season);
                return (
                  <TouchableOpacity
                    key={`${c.name}-${i}`}
                    onPress={() => toggleModalCrop(c.name)}
                    style={[st.modalCrop, st.cropChoice, selected && st.modalCropSelected]}
                  >
                    <CropIcon crop={c} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={st.itemTitle}>{c.name}</Text>
                      <Text style={st.harvestDate}>Первый урожай: {dateText(harvest)}</Text>
                      <Text style={st.muted}>
                        Время роста: {selectedGrowthDays} дн.
                        {c.regrow > 0 ? ` · повторно каждые ${c.regrow} дн.` : ''}
                      </Text>
                      {!harvestAllowed && (
                        <Text style={st.notReadyNote}>Не успеет созреть до конца сезона на ферме</Text>
                      )}
                      {c.specialNotes ? <Text style={st.muted}>{c.specialNotes}</Text> : null}
                    </View>
                    <View style={[st.checkCircle, selected && st.checkCircleOn]}>
                      {selected && <Text style={st.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {!visibleModalCrops.length && (
                <View style={st.emptyCrops}>
                  <Text style={st.itemTitle}>Ничего не найдено</Text>
                  <Text style={st.muted}>Попробуй другое название или выбери другое место выращивания.</Text>
                </View>
              )}
              {modalSelected.length > 0 && (
                <View style={st.selectedSummary}>
                  <Text style={st.optionsTitle}>Выбрано культур: {modalSelected.length}</Text>
                  <Text style={st.muted}>{modalSelected.join(' · ')}</Text>
                </View>
              )}
            </ScrollView>
            <View style={st.modalBottom}>
              <TouchableOpacity
                style={[st.addButton, !modalSelected.length && st.addButtonDisabled]}
                disabled={!modalSelected.length}
                onPress={addModalPlantings}
              >
                <Text style={st.addText}>СОХРАНИТЬ ПОСАДКУ · {modalSelected.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDayModal(false)} style={st.cancelButton}>
                <Text style={st.cancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={st.modalBackdrop}>
          <View style={st.confirmCard}>
            <View style={st.confirmIconWrap}>
              <Feather name="trash-2" size={25} color="#8b3e2f" />
            </View>
            <Text style={st.confirmEyebrow}>УПРАВЛЕНИЕ ФЕРМОЙ</Text>
            <Text style={st.confirmTitle}>Удалить посадку?</Text>
            <Text style={st.confirmMessage}>
              {deleteTarget
                ? `Убрать «${deleteTarget.crop}» из календаря? Все запланированные сборы этой культуры тоже исчезнут.`
                : ''}
            </Text>
            <View style={st.confirmActions}>
              <TouchableOpacity onPress={() => setDeleteTarget(null)} style={st.confirmCancel}>
                <Text style={st.confirmCancelText}>Оставить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (deleteTarget) {
                    setPlantings(old => old.filter(p => (deleteTarget.id ? p.id !== deleteTarget.id : p !== deleteTarget)));
                  }
                  setDeleteTarget(null);
                }}
                style={st.confirmDelete}
              >
                <Text style={st.confirmDeleteText}>Да, удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}