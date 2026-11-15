import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Platform, StyleSheet, TextInput, Alert, Modal, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { bundlesData, cropImagesData, fishImagesData, palette, seasonSprites, seasons, week, uiSprites, UIIcon, SeasonIcon, cropSpriteAssets, crops, cropDetails, fishSpriteAssets, fish, fishRules, cropRules, showValue, cropSeasonOrder, cropSeasonList, cropGrowingPlaceLines, cropGrowingSummary, cropLocationLabel, fishTimeDisplay, fishLevelDisplay, fishTypeLabel, fishSeasonText, fishLocationText, fishTimeText, fishWeatherText, fishCatchMethodText, isLegendaryFish, isCrabPotFish, isNightMarketFish, isOtherCatch, fishSearchText, seasonOrder, addDays, dateText } from './src/data/appData';
import { seasonThemes, st } from './src/styles/styles';

const CropIcon = ({ crop, size = 42 }) => {
    if (!crop) return null;

    const image = cropSpriteAssets?.[crop.name];

    if (!image) return null;

    return (
        <Image
            source={image}
            style={{ width: size, height: size }}
            resizeMode="contain"
        />
    );
};

function Panel({ children, style }) { return <View style={[st.panel, style]}>{children}</View>; }
function Btn({ children, onPress, active }) { return <TouchableOpacity onPress={onPress} style={[st.btn, active && st.btnOn]}><Text style={st.btnText}>{children}</Text></TouchableOpacity>; }
export default function App() {
    const [tab, setTab] = useState('Календарь'), [season, setSeason] = useState('Весна'), [day, setDay] = useState(1), [year, setYear] = useState(1);
    const [plantings, setPlantings] = useState([]), [loaded, setLoaded] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filter, setFilter] = useState('Все'), [cropSearch, setCropSearch] = useState(''), [expandedCrop, setExpandedCrop] = useState(null);
    const [dayModal, setDayModal] = useState(false), [modalSelected, setModalSelected] = useState([]), [modalCropSearch, setModalCropSearch] = useState('');
    const [plantingLocation, setPlantingLocation] = useState('farm'), [irrigated, setIrrigated] = useState(false), [qiQuestActive, setQiQuestActive] = useState(false);
    const [fishCategory, setFishCategory] = useState('Все'), [fishSearch, setFishSearch] = useState('');
    const [fishSeason, setFishSeason] = useState('Все сезоны'), [caughtFish, setCaughtFish] = useState([]), [fishLoaded, setFishLoaded] = useState(false);
    const [expandedFish, setExpandedFish] = useState(null);
    const [bundleSearch, setBundleSearch] = useState(''), [bundleVariant, setBundleVariant] = useState('standard'), [bundleRoom, setBundleRoom] = useState('Все'), [expandedBundle, setExpandedBundle] = useState(null);
    useEffect(() => { AsyncStorage.getItem('farm-caught-v1').then(v => { if (v) setCaughtFish(JSON.parse(v)); }).catch(() => {}).finally(() => setFishLoaded(true)); }, []);
    useEffect(() => { if (fishLoaded) AsyncStorage.setItem('farm-caught-v1', JSON.stringify(caughtFish)).catch(() => Alert.alert('Не удалось сохранить', 'Проверь доступность хранилища устройства.')); }, [caughtFish, fishLoaded]);
    const visibleFish = useMemo(() => fish.filter(f => {
        const matchesCategory = fishCategory === 'Все'
            || (fishCategory === 'Удочка' && (f.catchMethod === 'fishingRod' || f.type === 'regular' || f.type === 'legendary' || f.type === 'legendaryExtended'))
            || (fishCategory === 'Крабовые ловушки' && isCrabPotFish(f))
            || (fishCategory === 'Легендарные' && isLegendaryFish(f))
            || (fishCategory === 'Остров' && fishLocationText(f).toLocaleLowerCase('ru').includes('джинджер'))
            || (fishCategory === 'Ночной рынок' && isNightMarketFish(f))
            || (fishCategory === 'Особый улов' && isOtherCatch(f));
        const seasons = Array.isArray(f.seasons) ? f.seasons : (Array.isArray(f.season) ? f.season : String(f.season || '').split(/[;,]/).map(x => x.trim()));
        const islandAllYear = Array.isArray(f.gingerIslandSeasons) && f.gingerIslandSeasons.includes(fishSeason);
        const matchesSeason = fishSeason === 'Все сезоны' || seasons.includes(fishSeason)
            || String(f.season || '').toLocaleLowerCase('ru').includes(fishSeason.toLocaleLowerCase('ru'))
            || (fishSeason && Array.isArray(f.gingerIslandSeasons) && f.gingerIslandSeasons.includes(fishSeason));
        const matchesSearch = !fishSearch.trim() || fishSearchText(f).includes(fishSearch.trim().toLocaleLowerCase('ru'));
        return matchesCategory && matchesSeason && matchesSearch;
    }), [fishCategory, fishSeason, fishSearch]);
    useEffect(() => { AsyncStorage.getItem('farm-plantings-v1').then(v => { if (v) {
        const loadedPlantings = JSON.parse(v).map(p => ({ ...p, year: p.year || 1 }));
        setPlantings(loadedPlantings);
        const order = { Весна: 0, Лето: 1, Осень: 2, Зима: 3 };
        const latest = [...loadedPlantings].sort((a, b) => (b.year - a.year) || (order[b.season] - order[a.season]) || (b.day - a.day))[0];
        if (latest) {
            setYear(latest.year);
            setSeason(latest.season);
            setDay(latest.day);
        }
    } }).catch(() => { }).finally(() => setLoaded(true)); }, []);
    useEffect(() => { if (loaded)
        AsyncStorage.setItem('farm-plantings-v1', JSON.stringify(plantings)).catch(() => Alert.alert('Не удалось сохранить', 'Проверь доступность хранилища устройства.')); }, [plantings, loaded]);
    const encyclopediaCrops = useMemo(() => {
        const grouped = new Map();
        crops.forEach(c => {
            const item = grouped.get(c.name);
            if (item) {
                if (!item.seasons.includes(c.season)) item.seasons.push(c.season);
                item.days = Math.min(item.days, c.days);
                item.regrow = Math.max(item.regrow, c.regrow || 0);
                item.farmSeasons = [...new Set([...(item.farmSeasons || []), ...(c.farmSeasons || [c.season])])];
                item.growingLocations = [...new Set([...(item.growingLocations || []), ...(c.growingLocations || ['farm','greenhouse'])])];
                if (c.specialNotes && !item.specialNotes) item.specialNotes = c.specialNotes;
                if (c.irrigatedGrowthDays) item.irrigatedGrowthDays = c.irrigatedGrowthDays;
            } else {
                grouped.set(c.name, { ...c, seasons: [...(c.seasons || [c.season])] });
            }
        });
        const order = ['Весна','Лето','Осень','Зима'];
        return [...grouped.values()].map(c => ({
            ...c,
            seasons: [...new Set(c.seasons)].sort((a,b) => order.indexOf(a)-order.indexOf(b)),
            farmSeasons: [...new Set(c.farmSeasons || [])].sort((a,b) => order.indexOf(a)-order.indexOf(b))
        })).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    }, []);
    const seasonCrops = useMemo(() => {
        // Фильтр сезона показывает культуры, которые можно посадить в это
        // время на открытой ферме. Теплица не отменяет сезонность фермы.
        // Культуры, доступные на Имбирном острове круглый год, остаются
        // доступными и в зимнем фильтре.
        const bySeason = filter === 'Все' ? encyclopediaCrops : encyclopediaCrops.filter(c => {
            const farmSeasons = cropSeasonList(c.farmSeasons?.length ? c.farmSeasons : c.seasons);
            const canGrowOnFarm = farmSeasons.includes(filter);
            const canGrowOnIslandAllYear = (c.growingLocations || []).includes('gingerIsland');
            const hasNoFarmSeasonButIndoor = !(c.growingLocations || []).includes('farm')
                && (c.growingLocations || []).some(location => ['greenhouse', 'indoorPot'].includes(location));
            return canGrowOnFarm || canGrowOnIslandAllYear || hasNoFarmSeasonButIndoor;
        });
        const q = cropSearch.trim().toLocaleLowerCase('ru');
        return q ? bySeason.filter(c => {
            const searchable = [c.name, c.id, ...(c.aliases || [])].filter(Boolean).join(' ').toLocaleLowerCase('ru');
            return searchable.includes(q);
        }) : bySeason;
    }, [filter, encyclopediaCrops, cropSearch]);
    const modalCrops = useMemo(() => encyclopediaCrops.filter(c => {
        const locations = c.growingLocations || ['farm','greenhouse'];
        if (!locations.includes(plantingLocation)) return false;
        if (c.requiresActiveQuest && !qiQuestActive) return false;
        if (plantingLocation === 'farm' && !(c.farmSeasons || []).includes(season)) return false;
        return true;
    }), [encyclopediaCrops, season, plantingLocation, qiQuestActive]);
    const visibleModalCrops = useMemo(() => {
        const query = modalCropSearch.trim().toLocaleLowerCase('ru');
        if (!query) return modalCrops;
        return modalCrops.filter(c => c.name.toLocaleLowerCase('ru').includes(query) || String(c.id || '').toLocaleLowerCase('ru').includes(query));
    }, [modalCrops, modalCropSearch]);
    const toggleModalCrop = name => setModalSelected(old => old.includes(name) ? old.filter(x => x !== name) : [...old, name]);
    const addModalPlantings = () => {
        const dayCropNames = new Set(modalCrops.map(c => c.name));
        setPlantings(old => {
            const kept = old.filter(p => !(p.year === year && p.season === season && p.day === day && p.location === plantingLocation && dayCropNames.has(p.crop)));
            const entries = modalSelected.map(name => {
                const previous = old.find(p => p.year === year && p.season === season && p.day === day && p.crop === name && (p.location || 'farm') === plantingLocation);
                return previous ? { ...previous, irrigated: !!irrigated, qiQuestActive: !!qiQuestActive } : {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name}`,
                    crop: name, season, day, year, quantity: 1,
                    location: plantingLocation,
                    irrigated: !!irrigated,
                    qiQuestActive: !!qiQuestActive
                };
            });
            return [...kept, ...entries];
        });
        setModalSelected([]);
        setDayModal(false);
    };
    const allEvents = useMemo(() => plantings.flatMap(p => {
        const c = encyclopediaCrops.find(x => x.name === p.crop);
        if (!c) return [];
        const plantingYear = p.year || 1;
        const location = p.location || 'farm';
        const canGrowOn = (date) => {
            if (location !== 'farm') return true;
            const allowed = c.farmSeasons || [c.season];
            return allowed.includes(date.season);
        };
        const growthDays = p.irrigated && c.irrigatedGrowthDays ? c.irrigatedGrowthDays : c.days;
        const first = addDays(p.season, p.day, growthDays, plantingYear);
        if (!canGrowOn(first)) return [{ season: p.season, day: p.day, year: plantingYear, kind: 'Посадка', p, c }];
        let events = c.name === 'Чайные листья' ? [] : [{ ...first, kind: 'Первый сбор', p, c }];
        if (c.name === 'Чайные листья') {
            // Tea bushes produce leaves on days 22–28 of spring, summer and fall.
            // Winter harvest is shown only indoors/greenhouse.
            for (let y = first.year; y <= first.year + 2; y++) {
                for (const s of seasonOrder) {
                    if (s === 'Зима' && !['greenhouse','indoorPot'].includes(location)) continue;
                    for (let d = 22; d <= 28; d++) {
                        const candidate = { year: y, season: s, day: d };
                        const orderDate = (x) => (x.year * 112) + (seasonOrder.indexOf(x.season) * 28) + x.day;
                        if (orderDate(candidate) >= orderDate(first)) events.push({ ...candidate, kind: 'Сбор чайных листьев', p, c });
                    }
                }
            }
        } else if (c.regrow) {
            for (let i = 1; i < 8; i++) {
                const next = addDays(first.season, first.day, c.regrow * i, first.year);
                if (!canGrowOn(next)) break;
                events.push({ ...next, kind: 'Повторный сбор', p, c });
            }
        }
        return [{ season: p.season, day: p.day, year: plantingYear, kind: 'Посадка', p, c }, ...events];
    }), [plantings, encyclopediaCrops]);
    const dayEvents = allEvents.filter(e => e.year === year && e.season === season && e.day === day);
    const renderCalendar = () => <>
      <Panel style={[st.hero, seasonThemes[season]?.panel]}>
        <Text style={st.eyebrow}>ВАША ФЕРМА • ПЛАНИРОВЩИК</Text>
        <Text style={st.heroTitle}><SeasonIcon name={season} size={30}/> {season.toUpperCase()}</Text>
        <Text style={st.heroSub}>Планируй посадки и заранее смотри, когда собирать урожай.</Text>
        <Text style={st.beginnerHint}>Выбери день в календаре и нажми «Запланировать посадку». Приложение само отметит посадку и будущие сборы.</Text>
        <View style={st.yearSelector}>
          <TouchableOpacity onPress={() => setYear(y => Math.max(1, y - 1))} style={st.yearArrow}><Text style={st.yearArrowText}>‹</Text></TouchableOpacity>
          <Text style={st.yearLabel}>ГОД {year}</Text>
          <TouchableOpacity onPress={() => setYear(y => y + 1)} style={st.yearArrow}><Text style={st.yearArrowText}>›</Text></TouchableOpacity>
        </View>
        <View style={st.seasonRow}>
          {seasons.map(s => <TouchableOpacity key={s.name} activeOpacity={0.85}
            style={[st.btn, st.seasonBtn, st.calendarSeasonBtn, season === s.name && [st.btnOn, seasonThemes[season]?.selected]]}
            onPress={() => { if (season === 'Зима' && s.name === 'Весна') setYear(y => y + 1); setSeason(s.name); setDay(1); }}>
            <SeasonIcon name={s.name} size={24}/>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={st.btnText}>{s.name}</Text>
          </TouchableOpacity>)}
        </View>
      </Panel>
      <Panel>
        <Text style={st.panelTitle}>Календарь сезона · 28 дней</Text>
        <View style={st.calendar}>
          {week.map(w => <Text key={w} style={st.week}>{w}</Text>)}
          {Array.from({ length: 28 }, (_, i) => i + 1).map(n => {
            const ev = allEvents.filter(e => e.year === year && e.season === season && e.day === n);
            const hasPlant = ev.some(e => e.kind === 'Посадка');
            const hasHarvest = ev.some(e => e.kind !== 'Посадка');
            return <TouchableOpacity key={n} onPress={() => setDay(n)}
              style={[st.day, hasPlant && st.dayHasPlant, hasHarvest && st.dayHasHarvest, day === n && st.dayOn]}>
              <Text style={[st.dayNum, day === n && st.white]}>{n}</Text>
              {(hasPlant || hasHarvest) && <View style={st.dayMarkers}>
                {hasPlant && <View style={[st.dayMarker, st.plantMarker]}/>}
                {hasHarvest && <View style={[st.dayMarker, st.harvestMarker]}/>}
              </View>}
            </TouchableOpacity>;
          })}
        </View>
        <View style={st.calendarLegend}>
          <View style={st.legendItem}><View style={[st.dayMarker, st.plantMarker]}/><Text style={st.legendText}>Посадка</Text></View>
          <View style={st.legendItem}><View style={[st.dayMarker, st.harvestMarker]}/><Text style={st.legendText}>Сбор урожая</Text></View>
        </View>
        <View style={st.selected}>
          <View style={st.selectedDateRow}>
            <Text style={st.bigDay}>{day}</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.itemTitle}>{dateText({ season, day, year })}</Text>
              <Text style={st.muted}>
                {dayEvents.length ? `${dayEvents.filter(e => e.kind === 'Посадка').length} посадок · ${dayEvents.filter(e => e.kind !== 'Посадка').length} сборов` : 'На этот день пока ничего не запланировано'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => {
            setPlantingLocation('farm'); setModalCropSearch('');
            setIrrigated(plantings.some(p => (p.year || 1) === year && p.season === season && p.day === day && (p.location || 'farm') === 'farm' && p.irrigated));
            setQiQuestActive(plantings.some(p => (p.year || 1) === year && p.season === season && p.day === day && p.qiQuestActive));
            setModalSelected([...new Set(plantings.filter(p => (p.year || 1) === year && p.season === season && p.day === day && (p.location || 'farm') === 'farm').map(p => p.crop))]);
            setDayModal(true);
          }} style={st.dayAddButton}>
            <UIIcon name="plus" size={18}/><Text style={st.dayAddText}>Запланировать посадку</Text>
          </TouchableOpacity>
        </View>
      </Panel>
      <Text style={st.heading}>Что происходит в этот день</Text>
      {dayEvents.length ? dayEvents.map((e, i) => <Panel key={`${e.p.id || i}-${e.kind}-${i}`} style={[st.eventCard, e.kind === 'Посадка' ? st.plantEventCard : st.harvestEventCard]}>
        <CropIcon crop={e.c} size={40}/>
        <View style={{ flex: 1 }}>
          <Text style={st.eventKind}>{e.kind === 'Посадка' ? 'ПОСАДИТЬ' : 'ПОРА СОБИРАТЬ'}</Text>
          <Text style={st.itemTitle}>{e.c.name}</Text>
          <Text style={st.muted}>{e.p.quantity || 1} шт. · {({ farm: 'Ферма', greenhouse: 'Теплица', gingerIsland: 'Имбирный остров', indoorPot: 'Горшок в помещении' })[e.p.location || 'farm']}</Text>
          {e.kind !== 'Посадка' && <Text style={st.detail}>Посажено: {dateText({ season: e.p.season, day: e.p.day, year: e.p.year || 1 })}</Text>}
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Удалить посадку ${e.c.name}`} onPress={() => setDeleteTarget(e.p)} style={st.deletePlantButton}>
          <Feather name="trash-2" size={16} color="#8b3e2f"/>
        </TouchableOpacity>
      </Panel>) : <Panel><Text style={st.muted}>На этот день событий нет. Выбери другой день или запланируй новую посадку.</Text></Panel>}
    </>;
    const renderCrops = () => <><Panel style={st.hero}><Text style={st.eyebrow}>СПРАВОЧНИК ФЕРМЕРА</Text><Text style={st.heroTitle}><UIIcon name="crops" size={28}/> Культуры</Text><Text style={st.heroSub}>Узнай, что посадить и где вырастить</Text><Text style={st.beginnerHint}>Выбери сезон. В карточке каждой культуры сразу видно, где она растёт и в какое время года. Нажми на культуру, чтобы узнать цену семян и срок до урожая.</Text></Panel><TextInput value={cropSearch} onChangeText={setCropSearch} placeholder="Найти культуру..." placeholderTextColor={palette.muted} style={st.searchInput}/><View style={st.seasonRow}>{[{ name: 'Все' }, ...seasons].map(s => <TouchableOpacity key={s.name} activeOpacity={0.85} style={[st.btn, st.seasonBtn, filter === s.name && st.btnOn]} onPress={() => setFilter(s.name)}>{s.name === 'Все' ? <UIIcon name="crops" size={24}/> : <SeasonIcon name={s.name} size={24}/>}<Text numberOfLines={1} style={st.btnText}>{s.name}</Text></TouchableOpacity>)}</View><Text style={st.muted}>Для посадки в выбранный сезон (островные культуры доступны круглый год): {seasonCrops.length}</Text>{seasonCrops.map(c => { const d = cropDetails[c.name]; const opened = expandedCrop === c.name; const silver = d ? Math.floor(d.sell * 1.25) : null, gold = d ? Math.floor(d.sell * 1.5) : null, iridium = d ? d.sell * 2 : null; return <TouchableOpacity activeOpacity={0.9} key={c.name} onPress={() => setExpandedCrop(opened ? null : c.name)}><Panel style={st.cropCard}><View style={st.row}><CropIcon crop={c} size={46}/><View style={{ flex: 1 }}><Text style={st.itemTitle}>{c.name}</Text><Text style={st.growingSummary}>{cropGrowingSummary(c)}</Text><Text style={st.detail}>{c.regrow ? `Первый урожай через ${c.days} дн. · затем каждые ${c.regrow} дн.` : `До урожая: ${c.days} дн.`}</Text></View><Text style={st.expandMark}>{opened ? '−' : '+'}</Text></View>{opened && <View style={st.cropDetails}>
    <Text style={st.detailSection}>Где можно выращивать</Text>
    {cropGrowingPlaceLines(c).map((line, index) => <View key={`grow-${index}`} style={st.growingPlaceRow}><Text style={st.growingPlaceText}>{line}</Text></View>)}
    <Text style={st.detailSection}>Что важно знать</Text>
    <View style={st.detailGrid}>
      {[
        ['Семена', d ? `${showValue(d.seed)}${typeof d.seed === 'number' ? ' з.' : ''}` : null],
        ['Где купить / найти', d?.source || null],
        ['Цена продажи', d?.sell != null ? `${d.sell} з. за штуку` : null],
        ['Первый урожай', c.days != null ? `${c.days} дней` : null],
        ['Повторный урожай', c.regrow ? `Каждые ${c.regrow} дней` : 'Нет, собирается один раз'],
        ['Полив', (c.requiresWatering ?? d?.requiresWatering) === true ? 'Нужен каждый день' : (c.requiresWatering ?? d?.requiresWatering) === false ? 'Не требуется' : null],
        ['Шпалера', (c.trellis ?? d?.trellis) === true ? 'Да - нельзя пройти сквозь растение' : null],
        ['Опыт за сбор', d?.xp != null ? `${d.xp} опыта` : null],
      ].filter(([,value]) => value !== null && value !== undefined).map(([label,value]) => <View key={label} style={st.detailCell}><Text style={st.detailLabel}>{label}</Text><Text style={st.detailValue}>{value}</Text></View>)}
    </View>
    {c.requiresActiveQuest || d?.requiresActiveQuest ? <Text style={st.simpleNote}>Важно: доступна только во время задания «{showValue(c.requiresActiveQuest || d.requiresActiveQuest)}».</Text> : null}
    {c.growingCondition || d?.growingCondition ? <Text style={st.simpleNote}>{showValue(c.growingCondition || d.growingCondition)}</Text> : null}
    {c.specialNotes || d?.specialNotes ? <Text style={st.simpleNote}>{showValue(c.specialNotes || d.specialNotes)}</Text> : null}
    {c.harvestWindow || d?.harvestWindow ? <Text style={st.simpleNote}>Когда собирать: {showValue(c.harvestWindow || d.harvestWindow)}</Text> : null}
    {c.winterHarvestCondition || d?.winterHarvestCondition ? <Text style={st.simpleNote}>{showValue(c.winterHarvestCondition || d.winterHarvestCondition)}</Text> : null}
    {(c.irrigatedGrowthDays || d?.irrigatedGrowthDays) ? <Text style={st.simpleNote}>Рядом с водой созревает быстрее: {showValue(c.irrigatedGrowthDays || d.irrigatedGrowthDays)} дней.</Text> : null}
    {d?.use ? <><Text style={st.detailSection}>Для чего пригодится</Text><Text style={st.detailBody}>{showValue(d.use)}</Text></> : null}
    {d?.bundles ? <><Text style={st.detailSection}>Нужна для наборов</Text><Text style={st.detailBody}>{showValue(d.bundles)}</Text></> : null}
    <Text style={st.detailNote}>Источник: {c.wikiSource || d?.wikiSource || 'не указан'}</Text>
  </View>}</Panel></TouchableOpacity>; })}
      <Panel><Text style={st.panelTitle}>Как читать карточки</Text>
        <Text style={st.detailBody}>• «Ферма» - можно сажать только в указанные сезоны.</Text>
        <Text style={st.detailBody}>• «Теплица» и «Имбирный остров» - можно выращивать в любое время года.</Text>
        <Text style={st.detailBody}>• «Горшок в помещении» - можно выращивать в горшке внутри дома или другого помещения.</Text>
        <Text style={st.detailBody}>• Срок роста указан в днях при ежедневном поливе. Если культура даёт повторный урожай, это тоже указано в карточке.</Text>
      </Panel>
    </>;
    const fishCategories = ['Все', 'Удочка', 'Крабовые ловушки', 'Легендарные', 'Остров', 'Ночной рынок', 'Особый улов'];
    const fishSeasons = [{ name: 'Все сезоны' }, ...seasons];
    const renderFish = () => <><Panel style={st.hero}><Text style={st.eyebrow}>СПРАВОЧНИК РЫБАКА</Text><Text style={st.heroTitle}><UIIcon name="fish" size={28}/> Рыбалка</Text><Text style={st.heroSub}>Узнай, где и когда можно поймать каждую рыбу</Text><Text style={st.beginnerHint}>Выбери сезон и способ ловли. В карточке сразу увидишь главное, а по нажатию откроются подробности.</Text></Panel>
      <TextInput value={fishSearch} onChangeText={setFishSearch} placeholder="Найти рыбу или место..." placeholderTextColor={palette.muted} style={st.searchInput}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.fishFilterRow}>{fishCategories.map(c=><TouchableOpacity key={c} activeOpacity={0.85} onPress={()=>setFishCategory(c)} style={[st.btn,st.fishCategoryBtn,fishCategory===c&&st.btnOn]}><Text numberOfLines={1} style={st.btnText}>{c}</Text></TouchableOpacity>)}</ScrollView>
      <View style={st.seasonRow}>{fishSeasons.map(s=><TouchableOpacity key={s.name} activeOpacity={0.85} style={[st.btn,st.seasonBtn,fishSeason===s.name&&st.btnOn]} onPress={()=>setFishSeason(s.name)}>{s.name==='Все сезоны'?<UIIcon name="crops" size={24}/>:<SeasonIcon name={s.name} size={24}/>}<Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={st.btnText}>{s.name==='Все сезоны'?'Все':s.name}</Text></TouchableOpacity>)}</View>
      <View style={st.fishSummary}><Text style={st.muted}>Найдено рыб: {visibleFish.length} · Поймано: {caughtFish.length} из {fish.length}</Text><TouchableOpacity onPress={()=>{setFishCategory('Все');setFishSeason('Все сезоны');setFishSearch('');}}><Text style={st.fishReset}>Сбросить фильтры</Text></TouchableOpacity></View>
      {visibleFish.map(f => {
        const isCaught = caughtFish.includes(f.name), open = expandedFish === f.name;
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
        return <TouchableOpacity activeOpacity={0.9} key={f.name} onPress={() => setExpandedFish(open ? null : f.name)}>
          <Panel style={[st.cropCard, isCaught && st.fishCardCaught]}>
            <View style={st.row}>
              <View style={st.fishThumb}>{fishSpriteAssets[f.name] ? <Image source={fishSpriteAssets[f.name]} style={{width:46,height:46}} resizeMode="contain"/> : null}</View>
              <View style={{flex:1}}>
                <Text style={st.itemTitle}>{f.name}</Text>
                <Text style={st.growingSummary}>{fishTypeLabel(f)} · {fishCatchMethodText(f)}</Text>
                <Text style={st.detail}>Где: {location}</Text>
                <Text style={st.detail}>Когда: {seasonText}{time ? ` · ${time}` : ''}</Text>
                {weather ? <Text style={st.detail}>Погода: {weather}</Text> : null}
              </View>
              <View style={{alignItems:'center',gap:5}}>
                <TouchableOpacity onPress={()=>setCaughtFish(old=>isCaught?old.filter(n=>n!==f.name):[...old,f.name])} style={[st.fishCheck,isCaught&&st.fishCheckOn]}>
                  <Text style={[st.fishCheckText,isCaught&&st.fishCheckTextOn]}>{isCaught?'✓':'+'}</Text>
                </TouchableOpacity>
                <Text style={st.expandMark}>{open?'−':'+'}</Text>
              </View>
            </View>
            {open && <View style={st.cropDetails}>
              <Text style={st.detailSection}>Условия ловли</Text>
              <View style={st.detailGrid}>
                {detailRows.filter(([,value])=>value!==null&&value!==undefined&&value!=='').map(([label,value])=><View key={label} style={st.detailCell}><Text style={st.detailLabel}>{label}</Text><Text style={st.detailValue}>{showValue(value)}</Text></View>)}
                {Array.isArray(f.gingerIslandSeasons)&&f.gingerIslandSeasons.length>0?<View style={st.detailCell}><Text style={st.detailLabel}>Сезон на Имбирном острове</Text><Text style={st.detailValue}>{showValue(f.gingerIslandSeasons)}</Text></View>:null}
              </View>
              {f.requiresActiveQuest?<Text style={st.simpleNote}>Доступна только во время задания мистера Ци «Расширенное семейство».</Text>:null}
              {notes.length>0?<><Text style={st.detailSection}>Особые условия</Text><Text style={st.detailBody}>{notes.join(' ')}</Text></>:null}
              {isCrabPotFish(f)?<Text style={st.simpleNote}>Поставь крабовую ловушку в воду, добавь наживку и проверь её на следующий день.</Text>:null}
              <Text style={st.detailNote}>Нажми на галочку, чтобы отметить рыбу как пойманную.</Text>
            </View>}
            {!open?<Text style={st.detailNote}>Нажми на карточку, чтобы открыть подробности</Text>:null}
          </Panel>
        </TouchableOpacity>;
      })}
      {visibleFish.length===0?<Panel><Text style={st.muted}>Ничего не найдено. Попробуй изменить фильтры.</Text></Panel>:null}
      <Panel><Text style={st.panelTitle}>Как пользоваться справочником</Text>
        <Text style={st.detailBody}>• Выбери способ ловли и сезон, чтобы сократить список.</Text>
        <Text style={st.detailBody}>• В карточке смотри место, время суток и погоду.</Text>
        <Text style={st.detailBody}>• Нажми на карточку, чтобы открыть остальные условия.</Text>
        <Text style={st.detailBody}>• Нажми «+», чтобы отметить пойманную рыбу. Галочка означает, что она уже поймана.</Text>
        <Text style={st.detailBody}>• Волшебная наживка снимает обычные ограничения по сезону, времени и погоде, но не меняет место ловли.</Text>
        <Text style={st.detailBody}>• Крабовые ловушки проверяют на следующий день. Коптильня удваивает базовую цену рыбы.</Text>
      </Panel>
      <Text style={st.detailNote}>Цена указана без бонусов профессий и качества.</Text>
    </>;


    const bundleRooms = [
      {id:'crafts-room',name:'Комната ремёсел'},
      {id:'pantry',name:'Кладовая'},
      {id:'fish-tank',name:'Аквариум'},
      {id:'boiler-room',name:'Котельная'},
      {id:'bulletin-board',name:'Доска объявлений'},
      {id:'vault',name:'Хранилище'},
      {id:'abandoned-joja-mart',name:'Заброшенный JojaMart'}
    ];
    const bundleImageAssets = {
      'crafts-spring-foraging': require('./assets/bundles/spring-foraging-bundle.png'),
      'crafts-summer-foraging': require('./assets/bundles/summer-foraging-bundle.png'),
      'crafts-fall-foraging': require('./assets/bundles/fall-foraging-bundle.png'),
      'crafts-winter-foraging': require('./assets/bundles/winter-foraging-bundle.png'),
      'crafts-construction': require('./assets/bundles/construction-bundle.png'),
      'crafts-exotic-foraging': require('./assets/bundles/exotic-foraging-bundle.png'),
      'pantry-spring-crops': require('./assets/bundles/spring-crops-bundle.png'),
      'pantry-summer-crops': require('./assets/bundles/summer-crops-bundle.png'),
      'pantry-fall-crops': require('./assets/bundles/fall-crops-bundle.png'),
      'pantry-quality-crops': require('./assets/bundles/quality-crops-bundle.png'),
      'pantry-animal': require('./assets/bundles/animal-bundle.png'),
      'pantry-artisan': require('./assets/bundles/artisan-bundle.png'),
      'fish-river': require('./assets/bundles/river-fish-bundle.png'),
      'fish-lake': require('./assets/bundles/lake-fish-bundle.png'),
      'fish-ocean': require('./assets/bundles/ocean-fish-bundle.png'),
      'fish-night': require('./assets/bundles/night-fishing-bundle.png'),
      'fish-crab-pot': require('./assets/bundles/crab-pot-bundle.png'),
      'fish-specialty': require('./assets/bundles/specialty-fish-bundle.png'),
      'boiler-blacksmith': require('./assets/bundles/blacksmith-bundle.png'),
      'boiler-geologist': require('./assets/bundles/geologist-s-bundle.png'),
      'boiler-adventurer': require('./assets/bundles/adventurer-s-bundle.png'),
      'bulletin-chef': require('./assets/bundles/chef-s-bundle.png'),
      'bulletin-dye': require('./assets/bundles/dye-bundle.png'),
      'bulletin-field-research': require('./assets/bundles/field-research-bundle.png'),
      'bulletin-fodder': require('./assets/bundles/fodder-bundle.png'),
      'bulletin-enchanter': require('./assets/bundles/enchanter-s-bundle.png'),
      'vault-2500': require('./assets/bundles/2500-bundle.png'),
      'vault-5000': require('./assets/bundles/5000-bundle.png'),
      'vault-10000': require('./assets/bundles/10000-bundle.png'),
      'vault-25000': require('./assets/bundles/25000-bundle.png'),
      'missing-bundle': require('./assets/bundles/the-missing-bundle.png'),
      'remix-crafts-construction-sticky': require('./assets/bundles/sticky-bundle.png'),
      'remix-crafts-forest': require('./assets/bundles/forest-bundle.png'),
      'remix-crafts-wild-medicine': require('./assets/bundles/wild-medicine-bundle.png'),
      'remix-pantry-rare-crops': require('./assets/bundles/rare-crops-bundle.png'),
      'remix-pantry-fish-farmer': require('./assets/bundles/fish-farmer-s-bundle.png'),
      'remix-pantry-garden': require('./assets/bundles/garden-bundle.png'),
      'remix-pantry-brewer': require('./assets/bundles/brewer-s-bundle.png'),
      'remix-fish-quality': require('./assets/bundles/quality-fish-bundle.png'),
      'remix-fish-master': require('./assets/bundles/master-fisher-s-bundle.png'),
      'remix-boiler-treasure': require('./assets/bundles/treasure-hunter-s-bundle.png'),
      'remix-boiler-engineer': require('./assets/bundles/engineer-s-bundle.png'),
      'remix-bulletin-childrens': require('./assets/bundles/children-s-bundle.png'),
      'remix-bulletin-forager': require('./assets/bundles/forager-s-bundle.png'),
      'remix-bulletin-home-cook': require('./assets/bundles/home-cook-s-bundle.png'),
      'remix-bulletin-helper': require('./assets/bundles/helper-s-bundle.png'),
      'remix-bulletin-spirit-eve': require('./assets/bundles/spirit-s-eve-bundle.png'),
      'remix-bulletin-winter-star': require('./assets/bundles/winter-star-bundle.png'),
      'remix-crafts-spring': require('./assets/bundles/spring-foraging-bundle.png'),
      'remix-pantry-spring': require('./assets/bundles/spring-crops-bundle.png'),
      'remix-pantry-summer': require('./assets/bundles/summer-crops-bundle.png'),
      'remix-pantry-fall': require('./assets/bundles/fall-crops-bundle.png'),
      'remix-bulletin-dye': require('./assets/bundles/dye-bundle.png'),
      'remix-boiler-adventurer': require('./assets/bundles/adventurer-s-bundle.png'),
    };
    const bundleRoomImages = {
      'crafts-room': require('./assets/bundles/community-center-crafts-room.png'),
      'pantry': require('./assets/bundles/community-center-pantry.png'),
      'fish-tank': require('./assets/bundles/community-center-fish-tank.png'),
      'boiler-room': require('./assets/bundles/community-center-boiler-room.png'),
      'bulletin-board': require('./assets/bundles/community-center-bulletin-board.png'),
      'vault': require('./assets/bundles/community-center-vault.png'),
      'abandoned-joja-mart': require('./assets/bundles/the-missing-bundle.png')
    };
    const bundleNavIcon = require('./assets/ui/bundle.png');
        const bundleItemIcons = {
      "Абрикос": require('./assets/items/wiki/Apricot.png'),
      "Аквамарин": require('./assets/items/wiki/Aquamarine.png'),
      "Аккумулятор": require('./assets/items/wiki/Battery_Pack.png'),
      "Алмаз": require('./assets/items/wiki/Diamond.png'),
      "Амарант": require('./assets/crops/amaranth.png'),
      "Аметист": require('./assets/items/wiki/Amethyst.png'),
      "Апельсин": require('./assets/items/wiki/Orange.png'),
      "Баклажан": require('./assets/crops/eggplant.png'),
      "Белая водоросль": require('./assets/fish/fish-74.png'),
      "Билет с призом": require('./assets/items/wiki/Prize_Ticket.png'),
      "Большеротый окунь": require('./assets/fish/fish-18.png'),
      "Большое козье молоко": require('./assets/items/wiki/Large_Goat_Milk.png'),
      "Большое коричневое яйцо": require('./assets/items/wiki/Large_Brown_Egg.png'),
      "Большое молоко": require('./assets/items/wiki/Large_Milk.png'),
      "Большое яйцо": require('./assets/items/wiki/Large_Egg.png'),
      "Брокколи": require('./assets/crops/broccoli.png'),
      "Бычок": require('./assets/fish/fish-37.png'),
      "Весенний лук": require('./assets/items/wiki/Spring_Onion.png'),
      "Вино": require('./assets/items/wiki/Wine.png'),
      "Виноград": require('./assets/crops/grape.png'),
      "Вишня": require('./assets/items/wiki/Cherry.png'),
      "Волокно": require('./assets/items/wiki/Fiber.png'),
      "Выдержанная икра": require('./assets/items/wiki/Aged_Roe.png'),
      "Голец": require('./assets/items/wiki/Chub.png'),
      "Голубой джаз": require('./assets/crops/blue-jazz.png'),
      "Гранат": require('./assets/items/wiki/Pomegranate.png'),
      "Джем": require('./assets/items/wiki/Jelly.png'),
      "Дикая слива": require('./assets/items/wiki/Wild_Plum.png'),
      "Дикий хрен": require('./assets/items/wiki/Wild_Horseradish.png'),
      "Дино-майонез": require('./assets/items/wiki/Dinosaur_Mayonnaise.png'),
      "Древесина": require('./assets/items/wiki/Wood.png'),
      "Древний фрукт": require('./assets/crops/ancient-fruit.png'),
      "Древняя кукла": require('./assets/items/wiki/Ancient_Doll.png'),
      "Дубовая смола": require('./assets/items/wiki/Oak_Resin.png'),
      "Душистый горошек": require('./assets/items/wiki/Sweet_Pea.png'),
      "Дыня": require('./assets/crops/melon.png'),
      "Ежевика": require('./assets/items/wiki/Blackberry.png'),
      "Железный слиток": require('./assets/items/wiki/Iron_Bar.png'),
      "Жёлудь": require('./assets/items/wiki/Acorn.png'),
      "Замороженная геода": require('./assets/items/wiki/Frozen_Geode.png'),
      "Замороженная слеза": require('./assets/items/wiki/Frozen_Tear.png'),
      "Зелёная фасоль": require('./assets/crops/green-bean.png'),
      "Зелёный чай": require('./assets/items/wiki/Green_Tea.png'),
      "Земляной кристалл": require('./assets/items/wiki/Earth_Crystal.png'),
      "Зимний корень": require('./assets/items/wiki/Winter_Root.png'),
      "Золотой слиток": require('./assets/items/wiki/Gold_Bar.png'),
      "Иглобрюх": require('./assets/fish/fish-01.png'),
      "Изумруд": require('./assets/items/wiki/Emerald.png'),
      "Икра": require('./assets/items/wiki/Roe.png'),
      "Иридиевая руда": require('./assets/items/wiki/Iridium_Ore.png'),
      "Иридиевый слиток": require('./assets/items/wiki/Iridium_Bar.png'),
      "Камень": require('./assets/items/wiki/Stone.png'),
      "Капуста кейл": require('./assets/crops/kale.png'),
      "Карамбола": require('./assets/crops/starfruit.png'),
      "Карп": require('./assets/fish/fish-24.png'),
      "Картофель": require('./assets/crops/potato.png'),
      "Кварц": require('./assets/items/wiki/Quartz.png'),
      "Кленовое семечко": require('./assets/items/wiki/Maple_Seed.png'),
      "Кленовый сироп": require('./assets/items/wiki/Maple_Syrup.png'),
      "Козий сыр": require('./assets/items/wiki/Goat_Cheese.png'),
      "Кокос": require('./assets/items/wiki/Coconut.png'),
      "Костяной фрагмент": require('./assets/items/wiki/Bone_Fragment.png'),
      "Краб": require('./assets/fish/fish-64.png'),
      "Красная капуста": require('./assets/crops/red-cabbage.png'),
      "Красный гриб": require('./assets/items/wiki/Red_Mushroom.png'),
      "Красный луциан": require('./assets/items/wiki/Red_Snapper.png'),
      "Креветка": require('./assets/fish/fish-70.png'),
      "Крокус": require('./assets/items/wiki/Crocus.png'),
      "Кроличья лапка": require("./assets/items/wiki/Rabbit's_Foot.png"),
      "Крыло летучей мыши": require('./assets/items/wiki/Bat_Wing.png'),
      "Кукуруза": require('./assets/crops/corn.png'),
      "Лавовый угорь": require('./assets/fish/fish-43.png'),
      "Лесной орех": require('./assets/items/wiki/Hazelnut.png'),
      "Лесной прыгун": require('./assets/items/wiki/Woodskip.png'),
      "Летний блёсток": require('./assets/crops/summer-spangle.png'),
      "Летняя тыква": require('./assets/crops/summer-squash.png'),
      "Лещ": require('./assets/fish/fish-17.png'),
      "Лобстер": require('./assets/fish/fish-66.png'),
      "Лососевая ягода": require('./assets/items/wiki/Salmonberry.png'),
      "Лосось пустоты": require('./assets/items/wiki/Void_Salmon.png'),
      "Лук-порей": require('./assets/items/wiki/Leek.png'),
      "Мак": require('./assets/crops/poppy.png'),
      "Маки-ролл": require('./assets/items/wiki/Maki_Roll.png'),
      "Медный слиток": require('./assets/items/wiki/Copper_Bar.png'),
      "Медовуха": require('./assets/items/wiki/Mead.png'),
      "Мидия": require('./assets/fish/fish-67.png'),
      "Моллюск": require('./assets/items/wiki/Clam.png'),
      "Молоко": require('./assets/items/wiki/Milk.png'),
      "Морковь": require('./assets/crops/carrot.png'),
      "Мороженое": require('./assets/items/wiki/Ice_Cream.png'),
      "Морской гребешок": require('./assets/fish/fish-62.png'),
      "Морской моллюск": require('./assets/fish/fish-63.png'),
      "Морской ёж": require('./assets/items/wiki/Sea_Urchin.png'),
      "Мох": require('./assets/items/wiki/Moss.png'),
      "Мёд": require('./assets/items/wiki/Honey.png'),
      "Нарцисс": require('./assets/items/wiki/Daffodil.png'),
      "Наутилус": require('./assets/items/wiki/Nautilus_Shell.png'),
      "Начинка": require('./assets/items/wiki/Stuffing.png'),
      "Обычный гриб": require('./assets/items/wiki/Common_Mushroom.png'),
      "Огненный кварц": require('./assets/items/wiki/Fire_Quartz.png'),
      "Одуванчик": require('./assets/items/wiki/Dandelion.png'),
      "Острый перец": require('./assets/crops/hot-pepper.png'),
      "Осьминог": require('./assets/fish/fish-08.png'),
      "Осётр": require('./assets/fish/fish-29.png'),
      "Очищенный кварц": require('./assets/items/wiki/Refined_Quartz.png'),
      "Падуб": require('./assets/items/wiki/Holly.png'),
      "Папоротник": require('./assets/items/wiki/Fiddlehead_Fern.png'),
      "Пастернак": require('./assets/crops/parsnip.png'),
      "Персик": require('./assets/items/wiki/Peach.png'),
      "Песчаная рыба": require('./assets/items/wiki/Sandfish.png'),
      "Печенье": require('./assets/items/wiki/Cookie.png'),
      "Пещерная морковь": require('./assets/items/wiki/Cave_Carrot.png'),
      "Плод кактуса": require('./assets/crops/cactus-fruit.png'),
      "Подсолнух": require('./assets/crops/sunflower.png'),
      "Помидор": require('./assets/crops/tomato.png'),
      "Призматический осколок": require('./assets/items/wiki/Prismatic_Shard.png'),
      "Пряная ягода": require('./assets/items/wiki/Spice_Berry.png'),
      "Пшеница": require('./assets/crops/wheat.png'),
      "Пшеничная мука": require('./assets/items/wiki/Wheat_Flour.png'),
      "Речной рак": require('./assets/fish/fish-65.png'),
      "Рубин": require('./assets/items/wiki/Ruby.png'),
      "Рыба-капля": require('./assets/fish/fish-51.png'),
      "Рыба-призрак": require('./assets/items/wiki/Ghostfish.png'),
      "Сардина": require('./assets/fish/fish-04.png'),
      "Светлый эль": require('./assets/items/wiki/Pale_Ale.png'),
      "Свёкла": require('./assets/crops/beet.png'),
      "Сено": require('./assets/items/wiki/Hay.png'),
      "Сказочная роза": require('./assets/items/wiki/Fairy_Rose.png'),
      "Скорпионовый карп": require('./assets/fish/fish-39.png'),
      "Сладкая ягодка-самоцвет": require('./assets/crops/sweet-gem-berry.png'),
      "Сливовый пудинг": require('./assets/items/wiki/Plum_Pudding.png'),
      "Слизь": require('./assets/items/wiki/Slime.png'),
      "Сморчок": require('./assets/items/wiki/Morel.png'),
      "Снежная дыня": require('./assets/crops/powdermelon.png'),
      "Снежный ямс": require('./assets/items/wiki/Snow_Yam.png'),
      "Сок": require('./assets/items/wiki/Sap.png'),
      "Солнечная эссенция": require('./assets/items/wiki/Solar_Essence.png'),
      "Солнечник": require('./assets/fish/fish-27.png'),
      "Сом": require('./assets/fish/fish-25.png'),
      "Сосновая смола": require('./assets/items/wiki/Pine_Tar.png'),
      "Судак": require('./assets/fish/fish-22.png'),
      "Сыр": require('./assets/items/wiki/Cheese.png'),
      "Таинственная коробка": require('./assets/items/wiki/Mystery_Box.png'),
      "Твёрдая древесина": require('./assets/items/wiki/Hardwood.png'),
      "Тигровая форель": require('./assets/fish/fish-30.png'),
      "Тиляпия": require('./assets/fish/fish-14.png'),
      "Ткань": require('./assets/items/wiki/Cloth.png'),
      "Топаз": require('./assets/items/wiki/Topaz.png'),
      "Трюфель": require('./assets/items/wiki/Truffle.png'),
      "Трюфельное масло": require('./assets/items/wiki/Truffle_Oil.png'),
      "Тунец": require('./assets/fish/fish-03.png'),
      "Тыква": require('./assets/crops/pumpkin.png'),
      "Тюльпан": require('./assets/crops/tulip.png'),
      "Угорь": require('./assets/fish/fish-07.png'),
      "Улитка": require('./assets/fish/fish-71.png'),
      "Устрица": require('./assets/fish/fish-68.png'),
      "Утиное перо": require('./assets/items/wiki/Duck_Feather.png'),
      "Утиное яйцо": require('./assets/items/wiki/Duck_Egg.png'),
      "Фиолетовый гриб": require('./assets/items/wiki/Purple_Mushroom.png'),
      "Фонарь Джека": require('./assets/items/wiki/Jack-O-Lantern.png'),
      "Хмель": require('./assets/crops/hops.png'),
      "Хрустальный фрукт": require('./assets/items/wiki/Crystal_Fruit.png'),
      "Цветная капуста": require('./assets/crops/cauliflower.png'),
      "Черника": require('./assets/crops/blueberry.png'),
      "Чернила кальмара": require('./assets/items/wiki/Squid_Ink.png'),
      "Шерсть": require('./assets/items/wiki/Wool.png'),
      "Шэд": require('./assets/fish/fish-34.png'),
      "Эссенция пустоты": require('./assets/items/wiki/Void_Essence.png'),
      "Яблоко": require('./assets/items/wiki/Apple.png'),
      "Яичница": require('./assets/items/wiki/Fried_Egg.png'),
      "Яйцо": require('./assets/items/wiki/Egg.png'),
      "Ямс": require('./assets/crops/yam.png'),
    };
        const bundleColors = ['#79a85a','#9365a8','#d88b3c','#e4c34e','#c94e45','#5c8fc2','#55b9b0'];
    const bundleCardTints = ['rgba(121,168,90,0.13)','rgba(147,101,168,0.13)','rgba(216,139,60,0.14)','rgba(228,195,78,0.16)','rgba(201,78,69,0.12)','rgba(92,143,194,0.13)','rgba(85,185,176,0.13)'];
    const sourceBundles = (bundleVariant === 'standard' ? bundlesData.standardBundles : bundlesData.remixedBundles);
    const visibleBundles = sourceBundles.filter(b =>
      (bundleRoom === 'Все' || b.room === bundleRoom) &&
      `${b.name} ${bundleRooms.find(r=>r.id===b.room)?.name||''} ${b.items.map(i=>i.name).join(' ')}`.toLowerCase().includes(bundleSearch.toLowerCase())
    );
    const visibleRoomGroups = bundleRooms.map(room => ({...room, bundles: visibleBundles.filter(b=>b.room===room.id)})).filter(room=>room.bundles.length>0);
    const renderBundles = () => <><Panel style={st.hero}>
      <Text style={st.eyebrow}>СПРАВОЧНИК ЦЕНТРА СООБЩЕСТВА</Text>
      <View style={{flexDirection:"row",alignItems:"center",gap:8}}><Image source={bundleNavIcon} style={{width:30,height:30}} resizeMode="contain"/><Text style={st.heroTitle}>Узелки</Text></View>
      <Text style={st.heroSub}>Что собрать, где найти и как завершить наборы</Text>
      <Text style={st.beginnerHint}>Открой набор, чтобы посмотреть все необходимые предметы, способы получения, сезоны и награду. Стандартные и перемешанные наборы разделены.</Text>
    </Panel>
    <TextInput value={bundleSearch} onChangeText={setBundleSearch} placeholder="Найти набор или предмет..." placeholderTextColor={palette.muted} style={st.searchInput}/>
    <View style={st.bundleModeRow}>
      <TouchableOpacity onPress={()=>{setBundleVariant('standard');setExpandedBundle(null);}} style={[st.btn,st.bundleModeBtn,bundleVariant==='standard'&&st.btnOn]}><Text style={st.btnText}>Обычные наборы</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{setBundleVariant('remixed');setExpandedBundle(null);}} style={[st.btn,st.bundleModeBtn,bundleVariant==='remixed'&&st.btnOn]}><Text style={st.btnText}>Перемешанные</Text></TouchableOpacity>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.bundleRoomTabs}>
      <TouchableOpacity onPress={()=>setBundleRoom('Все')} style={[st.bundleRoomTab,bundleRoom==='Все'&&st.bundleRoomTabActive]}>
        <Image source={bundleNavIcon} style={st.bundleRoomIcon} resizeMode="contain"/>
        <Text style={st.bundleRoomTabText}>Все</Text>
      </TouchableOpacity>
      {bundleRooms.map(r=><TouchableOpacity key={r.id} onPress={()=>{setBundleRoom(r.id);setExpandedBundle(null);}} style={[st.bundleRoomTab,bundleRoom===r.id&&st.bundleRoomTabActive]}>
        <Image source={bundleRoomImages[r.id]} style={st.bundleRoomIcon} resizeMode="cover"/>
        <Text numberOfLines={2} style={st.bundleRoomTabText}>{r.name}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <Text style={st.muted}>Найдено наборов: {visibleBundles.length}</Text>
    {visibleRoomGroups.map(group=><View key={group.id} style={st.bundleRoomSection}>
      <View style={st.bundleRoomHeading}>
        <Image source={bundleRoomImages[group.id]} style={st.bundleRoomHeadingImage} resizeMode="cover"/>
        <View style={{flex:1}}>
          <Text style={st.panelTitle}>{group.name}</Text>
          <Text style={st.detail}>{group.bundles.length} наборов</Text>
        </View>
      </View>
      {group.bundles.map(b=>{
      const opened=expandedBundle===b.id, room=group, colorIndex=b.color?.index;
      const color=colorIndex==null?'#b99a6c':bundleColors[colorIndex]||'#b99a6c';
      const bundleIcon=bundleImageAssets[b.id] || (b.room==='abandoned-joja-mart'?bundleImageAssets['missing-bundle']:null);
      return <TouchableOpacity key={b.id} activeOpacity={0.9} onPress={()=>setExpandedBundle(opened?null:b.id)}>
        <Panel style={[st.cropCard, { backgroundColor: bundleCardTints[colorIndex] || 'rgba(185,154,108,0.12)', borderWidth: 1, borderColor: 'rgba(120,88,53,0.22)', borderLeftWidth: 4, borderLeftColor: color, marginTop: 0, marginBottom: 10, padding: 12 }]}>
          <View style={st.row}>
            {bundleIcon?<Image source={bundleIcon} style={st.bundleWikiIcon} resizeMode="contain"/>:<View style={[st.bundleSack,{backgroundColor:color,borderColor:palette.wood}]}><View style={st.bundleKnot}/><View style={st.bundleSackFold}/></View>}
            <View style={{flex:1}}>
              <Text style={st.itemTitle}>{b.name}</Text>
              <Text style={st.growingSummary}>{room?.name||'Центр сообщества'} · {b.itemsRequired} из {b.items.length} предметов</Text>
              <Text style={st.detail}>{b.color?.name ? `Цвет узелка: ${b.color.name}` : 'Цвет узелка для этого варианта не указан'}</Text>
            </View>
            <Text style={st.expandMark}>{opened?'−':'+'}</Text>
          </View>
          {opened&&<View style={st.cropDetails}>
            <Text style={st.detailSection}>Что нужно собрать</Text>
            {b.items.map((it,i)=><View key={`${b.id}-${i}`} style={st.bundleItem}>
              <Image source={bundleItemIcons[it.name]} style={st.bundleItemIcon} resizeMode="contain"/>
              <View style={{flex:1}}>
                <Text style={st.itemTitle}>{it.name}{it.quantity>1?` × ${it.quantity}`:''}</Text>
                {it.minimumQuality?<Text style={st.detail}>Качество: {it.minimumQuality}</Text>:null}
                {it.seasons?.length?<Text style={st.detail}>Сезон: {it.seasons.join(', ')}</Text>:null}
                {it.methods?.length?<Text style={st.detail}>Как получить: {it.methods.join('; ')}</Text>:null}
                {it.locations?.length?<Text style={st.detail}>Где найти: {it.locations.join('; ')}</Text>:null}
                {it.time?<Text style={st.detail}>Время: {it.time}</Text>:null}
                {it.weather?<Text style={st.detail}>Погода: {it.weather}</Text>:null}
                {it.notes?<Text style={st.simpleNote}>{it.notes}</Text>:null}
              </View>
            </View>)}
            <Text style={st.detailSection}>Условия завершения</Text>
            <Text style={st.detailBody}>{b.selectionMode==='choose'?`Нужно выбрать ${b.itemsRequired} предмета(ов) из списка.`:`Нужно сдать все ${b.itemsRequired} предмета(ов).`}</Text>
            {b.notes?<Text style={st.simpleNote}>{Array.isArray(b.notes)?b.notes.join(' '):b.notes}</Text>:null}
            {b.reward?<><Text style={st.detailSection}>Награда</Text><Text style={st.detailBody}>{b.reward.name}{b.reward.quantity?` × ${b.reward.quantity}`:''}</Text></>:null}
            <Text style={st.detailNote}>Цвет и требования показаны по данным справочника. Для перемешанных вариантов цвет может быть неизвестен.</Text>
          </View>}
        </Panel>
      </TouchableOpacity>;
      })}
    </View>)}
    {visibleBundles.length===0?<Panel><Text style={st.muted}>Ничего не найдено. Измени запрос или фильтр комнаты.</Text></Panel>:null}
    <Panel><Text style={st.panelTitle}>Как пользоваться справочником</Text>
      <Text style={st.detailBody}>• Выбери обычные или перемешанные наборы в зависимости от настроек новой игры.</Text>
      <Text style={st.detailBody}>• Фильтр по комнате помогает найти нужный раздел Центра сообщества.</Text>
      <Text style={st.detailBody}>• Открой карточку, чтобы увидеть количество, качество и способы получения каждого предмета.</Text>
    </Panel></>;

    const tabs = [['Календарь', 'calendar'], ['Культуры', 'crops'], ['Рыбалка', 'fish'], ['Узелки', 'bundles']];
    return <SafeAreaProvider><SafeAreaView style={st.safe}><ExpoStatusBar style="dark"/><StatusBar barStyle="dark-content" backgroundColor={palette.paper}/><View style={st.top}><View style={st.brandBlock}><Text style={st.brand}>FARM PLANNER</Text><Text style={st.brandSub}>ТВОЙ СЕЗОННЫЙ ПОМОЩНИК</Text></View><Image source={require("./assets/profile/farmer.png")} style={st.farmerPortrait} resizeMode="contain"/></View><ScrollView contentContainerStyle={st.content}>{tab === 'Календарь' ? renderCalendar() : tab === 'Культуры' ? renderCrops() : tab === 'Рыбалка' ? renderFish() : renderBundles()}<Text style={st.footer}>FARM PLANNER · STARDEW VALLEY COMPANION</Text></ScrollView>
 <Modal visible={dayModal} transparent animationType="fade" onRequestClose={() => setDayModal(false)}>
  <View style={st.modalBackdrop}>
   <View style={st.modalCard}>
    <View style={st.modalHeader}>
     <View style={{ flex: 1 }}>
      <Text style={st.modalEyebrow}>НОВАЯ ПОСАДКА</Text>
      <Text style={st.modalTitle}><SeasonIcon name={season} size={24}/> {day} день · {season.toLowerCase()}</Text>
      <Text style={st.modalIntro}>Сначала выбери место, затем отметь культуры. Мы покажем примерную дату первого урожая.</Text>
     </View>
     <TouchableOpacity onPress={() => setDayModal(false)} style={st.closeButton}><UIIcon name="close" size={24}/></TouchableOpacity>
    </View>
    <ScrollView style={st.modalBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
     <Text style={st.modalSectionTitle}>1. Где будешь сажать?</Text>
     <View style={st.locationGrid}>
      {[
       ['farm','Ферма','Только культуры этого сезона'],
       ['greenhouse','Теплица','Можно выращивать круглый год'],
       ['gingerIsland','Имбирный остров','Можно выращивать круглый год'],
       ['indoorPot','Горшок в помещении','Для культур, которым подходит горшок']
      ].map(([key,label,description]) => <TouchableOpacity key={key} onPress={() => { setPlantingLocation(key); setModalSelected([]); setModalCropSearch(''); }}
        style={[st.locationOption, plantingLocation === key && st.locationOptionActive]}>
        <View style={[st.locationRadio, plantingLocation === key && st.locationRadioActive]}>{plantingLocation === key && <View style={st.locationRadioDot}/>}</View>
        <View style={{ flex: 1 }}>
         <Text style={st.locationTitle}>{label}</Text>
         <Text style={st.locationDescription}>{description}</Text>
        </View>
       </TouchableOpacity>)}
     </View>
     {(plantingLocation === 'farm' || plantingLocation === 'gingerIsland') && <View style={st.optionsBox}>
       <Text style={st.optionsTitle}>Особые условия</Text>
       <TouchableOpacity onPress={() => setIrrigated(v => !v)} style={st.optionToggle}>
        <View style={[st.checkCircle, irrigated && st.checkCircleOn]}>{irrigated && <Text style={st.checkMark}>✓</Text>}</View>
        <View style={{ flex: 1 }}>
         <Text style={st.itemTitle}>Рядом есть вода</Text>
         <Text style={st.muted}>Для риса и корня таро рост будет быстрее</Text>
        </View>
       </TouchableOpacity>
      </View>}
     <View style={st.optionsBox}>
      <Text style={st.optionsTitle}>Задание «Урожай Ки»</Text>
      <TouchableOpacity onPress={() => setQiQuestActive(v => !v)} style={st.optionToggle}>
       <View style={[st.checkCircle, qiQuestActive && st.checkCircleOn]}>{qiQuestActive && <Text style={st.checkMark}>✓</Text>}</View>
       <View style={{ flex: 1 }}>
        <Text style={st.itemTitle}>Я выполняю это задание</Text>
        <Text style={st.muted}>Включи, если выращиваешь специальные культуры для задания</Text>
       </View>
      </TouchableOpacity>
     </View>
     <View style={st.cropPickerHeader}>
      <View style={{ flex: 1 }}>
       <Text style={st.modalSectionTitle}>2. Какие культуры посадить?</Text>
       <Text style={st.muted}>Доступно: {modalCrops.length} · Выбрано: {modalSelected.length}</Text>
      </View>
     </View>
     <TextInput value={modalCropSearch} onChangeText={setModalCropSearch} placeholder="Найти культуру..." placeholderTextColor={palette.muted} style={st.modalSearch}/>
     {visibleModalCrops.map((c, i) => {
        const selected = modalSelected.includes(c.name);
        const selectedGrowthDays = irrigated && c.irrigatedGrowthDays ? c.irrigatedGrowthDays : c.days;
        const harvest = addDays(season, day, selectedGrowthDays, year);
        const harvestAllowed = plantingLocation !== 'farm' || (c.farmSeasons || []).includes(harvest.season);
        return <TouchableOpacity key={`${c.name}-${i}`} onPress={() => toggleModalCrop(c.name)} style={[st.modalCrop, st.cropChoice, selected && st.modalCropSelected]}>
          <CropIcon crop={c} size={42}/>
          <View style={{ flex: 1 }}>
           <Text style={st.itemTitle}>{c.name}</Text>
           <Text style={st.harvestDate}>Первый урожай: {dateText(harvest)}</Text>
           <Text style={st.muted}>Время роста: {selectedGrowthDays} дн.{c.regrow > 0 ? ` · повторно каждые ${c.regrow} дн.` : ''}</Text>
           {!harvestAllowed && <Text style={st.notReadyNote}>Не успеет созреть до конца сезона на ферме</Text>}
           {c.specialNotes ? <Text style={st.muted}>{c.specialNotes}</Text> : null}
          </View>
          <View style={[st.checkCircle, selected && st.checkCircleOn]}>{selected && <Text style={st.checkMark}>✓</Text>}</View>
        </TouchableOpacity>;
     })}
     {!visibleModalCrops.length && <View style={st.emptyCrops}><Text style={st.itemTitle}>Ничего не найдено</Text><Text style={st.muted}>Попробуй другое название или выбери другое место выращивания.</Text></View>}
     {modalSelected.length > 0 && <View style={st.selectedSummary}>
       <Text style={st.optionsTitle}>Выбрано культур: {modalSelected.length}</Text>
       <Text style={st.muted}>{modalSelected.join(' · ')}</Text>
      </View>}
    </ScrollView>
    <View style={st.modalBottom}>
     <TouchableOpacity style={[st.addButton, !modalSelected.length && st.addButtonDisabled]} disabled={!modalSelected.length} onPress={addModalPlantings}>
      <Text style={st.addText}>СОХРАНИТЬ ПОСАДКУ · {modalSelected.length}</Text>
     </TouchableOpacity>
     <TouchableOpacity onPress={() => setDayModal(false)} style={st.cancelButton}><Text style={st.cancelText}>Отмена</Text></TouchableOpacity>
    </View>
   </View>
  </View>
 </Modal> 
  <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
   <View style={st.modalBackdrop}>
    <View style={st.confirmCard}>
     <View style={st.confirmIconWrap}><Feather name="trash-2" size={25} color="#8b3e2f"/></View>
     <Text style={st.confirmEyebrow}>УПРАВЛЕНИЕ ФЕРМОЙ</Text>
     <Text style={st.confirmTitle}>Удалить посадку?</Text>
     <Text style={st.confirmMessage}>{deleteTarget ? `Убрать «${deleteTarget.crop}» из календаря? Все запланированные сборы этой культуры тоже исчезнут.` : ''}</Text>
     <View style={st.confirmActions}>
      <TouchableOpacity onPress={() => setDeleteTarget(null)} style={st.confirmCancel}><Text style={st.confirmCancelText}>Оставить</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { if (deleteTarget) setPlantings(old => old.filter(p => deleteTarget.id ? p.id !== deleteTarget.id : p !== deleteTarget)); setDeleteTarget(null); }} style={st.confirmDelete}><Text style={st.confirmDeleteText}>Да, удалить</Text></TouchableOpacity>
     </View>
    </View>
   </View>
  </Modal>
 <View style={st.nav}>{tabs.map(([name, icon]) => <TouchableOpacity key={name} onPress={() => setTab(name)} style={st.navItem}>{icon === "bundles" ? <Image source={bundleNavIcon} style={{width:27,height:27}} resizeMode="contain"/> : <UIIcon name={icon} size={25}/>}<Text style={[st.navText, tab === name && { color: '#fff0c9' }]}>{name}</Text></TouchableOpacity>)}</View></SafeAreaView></SafeAreaProvider>;
}
