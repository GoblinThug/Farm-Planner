import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AnimatedModal } from '../components/AnimatedModal';
import { Feather } from '@expo/vector-icons';
import { seasons, week, SeasonIcon, gameEvents, dateText } from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { Panel } from '../components/Panel';
import { BirthdayGiftCard } from '../components/BirthdayGiftCard';
import {
  buildEventFilterOptions,
  dayMatchesEventFilter,
  eventsOnDay,
  EVENT_FILTER_ALL,
  isTravelingMerchantDay,
  weekdayNameForDay,
} from '../utils/gameCalendar';

export function GameEventsScreen() {
  const { st, palette, seasonThemes } = useTheme();
  const [season, setSeason] = useState('Весна');
  const [day, setDay] = useState(1);
  const [communityCenterComplete, setCommunityCenterComplete] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(EVENT_FILTER_ALL);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [includeBirthdays, setIncludeBirthdays] = useState(false);

  const eventOptions = useMemo(() => buildEventFilterOptions(gameEvents, { includeBirthdays }), [includeBirthdays]);
  const selectedFilter = useMemo(
    () => eventOptions.find(o => o.id === selectedEventId) || eventOptions[0],
    [eventOptions, selectedEventId]
  );

  const dayInfo = useMemo(() => eventsOnDay(gameEvents, season, day), [season, day]);
  const merchantToday = isTravelingMerchantDay(day, communityCenterComplete);

  const monthMarkers = useMemo(() => {
    const map = {};
    for (let n = 1; n <= 28; n++) {
      const { birthdays, festivals } = eventsOnDay(gameEvents, season, n);
      const merchant = isTravelingMerchantDay(n, communityCenterComplete);
      const matchesFilter = dayMatchesEventFilter(selectedFilter, season, n, communityCenterComplete, gameEvents);
      const birthdaysVisible = includeBirthdays ? birthdays : [];
      map[n] = {
        birthdays: birthdaysVisible,
        festivals,
        merchant,
        matchesFilter,
        highlight:
          matchesFilter && ((includeBirthdays && birthdays.length) || festivals.length || merchant),
      };
    }
    return map;
  }, [season, communityCenterComplete, selectedFilter, includeBirthdays]);

  const pickEvent = option => {
    setSelectedEventId(option.id);
    setPickerOpen(false);
    if (option.season && option.day) {
      setSeason(option.season);
      setDay(option.day);
    }
  };

  const showAllMarkers = selectedEventId === EVENT_FILTER_ALL;

  const birthdaysForGifts = useMemo(() => {
    if (!includeBirthdays) return [];
    if (
      selectedFilter.kind === 'birthday' &&
      selectedFilter.season === season &&
      selectedFilter.day === day
    ) {
      return [{ name: selectedFilter.name }];
    }
    if (showAllMarkers) return dayInfo.birthdays;
    return [];
  }, [includeBirthdays, selectedFilter, season, day, showAllMarkers, dayInfo.birthdays]);

  return (
    <>
      <Panel style={[st.hero, seasonThemes[season]?.panel]}>
        <Text style={st.eyebrow}>КАЛЕНДАРЬ ДОЛИНЫ</Text>
        <Text style={st.heroTitle}>
          <SeasonIcon name={season} size={30} /> События
        </Text>
        <Text style={st.heroSub}>Дни рождения, праздники и визиты странствующего торговца</Text>
        <View style={st.seasonRow}>
          {seasons.map(s => (
            <TouchableOpacity
              key={s.name}
              activeOpacity={0.85}
              style={[
                st.btn,
                st.heroChip,
                st.seasonBtn,
                st.calendarSeasonBtn,
                season === s.name && [st.heroChipOn, seasonThemes[season]?.selected],
              ]}
              onPress={() => {
                setSeason(s.name);
                setDay(1);
              }}
            >
              <SeasonIcon name={s.name} size={24} />
              <Text numberOfLines={1} style={[st.btnTextLight, season === s.name && st.heroChipTextOn]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Panel>
      <Panel>
        <Text style={st.detailLabel}>СОБЫТИЕ</Text>
        <TouchableOpacity style={st.eventFilterSelect} onPress={() => setPickerOpen(true)} activeOpacity={0.88}>
          <View style={st.flex1}>
            <Text style={st.itemTitle}>{selectedFilter.label}</Text>
            {selectedFilter.sublabel ? <Text style={st.muted}>{selectedFilter.sublabel}</Text> : null}
          </View>
          <Feather name="chevron-down" size={22} color={palette.brown} />
        </TouchableOpacity>
      </Panel>
      <Panel>
        <TouchableOpacity onPress={() => setCommunityCenterComplete(v => !v)} style={st.optionToggle}>
          <View style={[st.checkCircle, communityCenterComplete && st.checkCircleOn]}>
            {communityCenterComplete ? <Text style={st.checkMark}>✓</Text> : null}
          </View>
          <View style={st.flex1}>
            <Text style={st.itemTitle}>Центр сообщества восстановлен</Text>
            <Text style={st.muted}>
              {communityCenterComplete ? 'Торговец приезжает по средам' : 'Торговец приезжает по пятницам и воскресеньям'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setIncludeBirthdays(v => {
              const next = !v;
              if (!next && selectedFilter?.kind === 'birthday') {
                setSelectedEventId(EVENT_FILTER_ALL);
              }
              return next;
            });
          }}
          style={[st.optionToggle, { marginTop: 10 }]}
        >
          <View style={[st.checkCircle, includeBirthdays && st.checkCircleOn]}>
            {includeBirthdays ? <Text style={st.checkMark}>✓</Text> : null}
          </View>
          <View style={st.flex1}>
            <Text style={st.itemTitle}>Показывать дни рождения</Text>
            <Text style={st.muted}>В календаре, списке событий и выпадающем фильтре</Text>
          </View>
        </TouchableOpacity>
      </Panel>
      <Panel>
        <Text style={st.panelTitle}>Календарь сезона</Text>
        <View style={st.calendar}>
          {week.map(w => (
            <Text key={w} style={st.week}>
              {w}
            </Text>
          ))}
          {Array.from({ length: 28 }, (_, i) => i + 1).map(n => {
            const m = monthMarkers[n];
            const dimmed = !showAllMarkers && !m.matchesFilter;
            const hasMerchant = showAllMarkers ? m.merchant : selectedFilter.kind === 'merchant' && m.merchant;
            const hasFest = showAllMarkers ? m.festivals.length > 0 : selectedFilter.kind === 'festival' && m.matchesFilter;
            const hasBday =
              includeBirthdays &&
              (showAllMarkers ? m.birthdays.length > 0 : selectedFilter.kind === 'birthday' && m.matchesFilter);
            const showMarkers = !dimmed && (hasMerchant || hasFest || hasBday);
            return (
              <TouchableOpacity
                key={n}
                onPress={() => setDay(n)}
                style={[
                  st.day,
                  dimmed && st.eventDayDimmed,
                  hasMerchant && st.dayHasPlant,
                  (hasFest || hasBday) && st.dayHasHarvest,
                  day === n && st.dayOn,
                ]}
              >
                <Text style={[st.dayNum, day === n && st.white, dimmed && st.eventDayDimmedText]}>{n}</Text>
                {showMarkers && (
                  <View style={st.dayMarkers}>
                    {hasMerchant && <View style={[st.dayMarker, st.plantMarker]} />}
                    {(hasBday || hasFest) && <View style={[st.dayMarker, st.harvestMarker]} />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={st.calendarLegend}>
          <View style={st.legendItem}>
            <View style={[st.dayMarker, st.plantMarker]} />
            <Text style={st.legendText}>Торговец</Text>
          </View>
          <View style={st.legendItem}>
            <View style={[st.dayMarker, st.harvestMarker]} />
            <Text style={st.legendText}>{includeBirthdays ? 'ДР / праздник' : 'Праздник'}</Text>
          </View>
        </View>
      </Panel>
      {birthdaysForGifts.length > 0 ? (
        <Panel>
          <Text style={st.panelTitle}>Дни рождения · подарки</Text>
          <Text style={[st.muted, { marginBottom: 8 }]}>
            Любимые подарки для выбранного дня ({birthdaysForGifts.length})
          </Text>
          {birthdaysForGifts.map(b => (
            <BirthdayGiftCard key={b.name} name={b.name} />
          ))}
        </Panel>
      ) : null}
      <Panel>
        <Text style={st.panelTitle}>
          {dateText({ season, day, year: 1 })} · {weekdayNameForDay(day)}
        </Text>
        {merchantToday && (showAllMarkers || selectedFilter.kind === 'merchant' || selectedFilter.kind === 'all') ? (
          <View style={[st.growingPlaceRow, { marginTop: 6 }]}>
            <Text style={st.growingPlaceText}>{gameEvents.travelingMerchant.title} — сегодня в долине</Text>
            <Text style={st.detail}>{gameEvents.travelingMerchant.time}</Text>
            {gameEvents.travelingMerchant.locations.map((loc, i) => (
              <Text key={i} style={st.muted}>
                • {loc}
              </Text>
            ))}
          </View>
        ) : selectedFilter.kind === 'merchant' ? (
          <Text style={st.muted}>В этот день торговца нет.</Text>
        ) : null}
        {dayInfo.festivals.length > 0 && showAllMarkers ? (
          <>
            <Text style={st.detailSection}>Праздники</Text>
            {dayInfo.festivals.map(f => (
              <Text key={f.name} style={st.detailBody}>
                • {f.name}
                {f.location ? ` — ${f.location}` : ''}
              </Text>
            ))}
          </>
        ) : null}
        {includeBirthdays && dayInfo.birthdays.length > 0 && showAllMarkers ? (
          <>
            <Text style={st.detailSection}>Дни рождения</Text>
            {dayInfo.birthdays.map(b => (
              <Text key={b.name} style={st.detailBody}>
                • {b.name}
              </Text>
            ))}
          </>
        ) : null}
        {selectedFilter.kind === 'festival' && selectedFilter.season === season && selectedFilter.day === day ? (
          <Text style={st.detailBody}>
            • {selectedFilter.name}
            {selectedFilter.location ? ` — ${selectedFilter.location}` : ''}
          </Text>
        ) : null}
        {includeBirthdays &&
        selectedFilter.kind === 'birthday' &&
        selectedFilter.season === season &&
        selectedFilter.day === day ? (
          <Text style={st.detailBody}>• День рождения: {selectedFilter.name}</Text>
        ) : null}
        {showAllMarkers &&
        !dayInfo.festivals.length &&
        !(includeBirthdays && dayInfo.birthdays.length) &&
        !merchantToday ? (
          <Text style={st.muted}>На этот день особых событий в списке нет.</Text>
        ) : null}
      </Panel>
      <Panel>
        <Text style={st.panelTitle}>О торговце</Text>
        <Text style={st.detailBody}>{gameEvents.travelingMerchant.beforeCommunityCenter.note}</Text>
        <Text style={st.detailBody}>{gameEvents.travelingMerchant.afterCommunityCenter.note}</Text>
      </Panel>

      <AnimatedModal visible={pickerOpen} onRequestClose={() => setPickerOpen(false)} cardStyle={st.navMenuCard}>
            <View style={st.modalHeader}>
              <View style={st.flex1}>
                <Text style={st.modalEyebrow}>ФИЛЬТР</Text>
                <Text style={st.navMenuTitle}>Выбери событие</Text>
              </View>
              <TouchableOpacity onPress={() => setPickerOpen(false)} style={st.closeButton}>
                <Feather name="x" size={22} color={palette.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView style={st.navMenuList} showsVerticalScrollIndicator={false}>
              {eventOptions.map(option => {
                const active = option.id === selectedEventId;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => pickEvent(option)}
                    style={[st.navMenuRow, active && st.navMenuRowActive]}
                  >
                    <View style={st.flex1}>
                      <Text style={st.navMenuRowTitle}>{option.label}</Text>
                      {option.sublabel ? <Text style={st.navMenuRowHint}>{option.sublabel}</Text> : null}
                    </View>
                    {active ? <Feather name="check" size={20} color={palette.greenDark} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setPickerOpen(false)} style={st.cancelButton}>
              <Text style={st.cancelText}>Закрыть</Text>
            </TouchableOpacity>
      </AnimatedModal>
    </>
  );
}