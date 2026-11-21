import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Share, Platform } from 'react-native';
import { UIIcon } from '../data/appData';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { AnimatedModal } from './AnimatedModal';

function MenuRow({ title, hint, active, onPress, danger }) {
  const { st } = useTheme();
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[st.navMenuRow, active && st.navMenuRowActive]}>
      <View style={st.flex1}>
        <Text style={[st.navMenuRowTitle, danger && { color: '#8b3e2f' }]}>{title}</Text>
        {hint ? <Text style={[st.navMenuRowHint, danger && { color: '#a85a4a' }]}>{hint}</Text> : null}
        {active && !hint ? <Text style={st.navMenuRowHint}>Сейчас выбрано</Text> : null}
      </View>
      {active ? (
        <Text style={st.navMenuRowCheck}>✓</Text>
      ) : (
        <Text style={st.navMenuRowChevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export function ProfileMenuModal({ visible, onClose }) {
  const { st, palette } = useTheme();
  const {
    activeProfile,
    meta,
    switchProfile,
    addProfile,
    renameProfile,
    deleteProfile,
    exportAllData,
    importAllData,
  } = useProfile();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const startRename = () => {
    setRenameValue(activeProfile?.name || '');
    setRenameOpen(true);
  };

  const runExport = async () => {
    try {
      const json = exportAllData();
      if (Platform.OS === 'web') {
        setImportValue(json);
        setImportOpen(true);
        Alert.alert('Экспорт', 'Данные показаны в окне импорта — скопируй JSON вручную.');
        return;
      }
      await Share.share({ message: json, title: 'Экспорт Farm Planner' });
    } catch {
      Alert.alert('Не удалось экспортировать', 'Попробуй ещё раз.');
    }
  };

  const runImport = () => {
    try {
      const count = importAllData(importValue);
      setImportOpen(false);
      setImportValue('');
      Alert.alert('Готово', `Загружено профилей: ${count}`);
    } catch (e) {
      Alert.alert('Ошибка импорта', e?.message || 'Проверь формат JSON.');
    }
  };

  return (
    <>
      <AnimatedModal visible={visible} onRequestClose={onClose} cardStyle={st.navMenuCard}>
        <View style={st.modalHeader}>
          <View style={st.flex1}>
            <Text style={st.modalEyebrow}>ПРОФИЛЬ ФЕРМЫ</Text>
            <Text style={st.navMenuTitle}>{activeProfile?.name || 'Ферма'}</Text>
            <Text style={st.modalIntro}>
              Посадки, рыбалка и узелки сохраняются отдельно для каждого профиля. Экспорт включает все профили сразу.
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={st.closeButton} accessibilityLabel="Закрыть меню профиля">
            <UIIcon name="close" size={24} />
          </TouchableOpacity>
        </View>
        <ScrollView style={st.navMenuList} showsVerticalScrollIndicator={false}>
          <Text style={[st.modalEyebrow, st.sectionEyebrowTight]}>СМЕНИТЬ ПРОФИЛЬ</Text>
          {meta.profiles.map(p => {
            const active = p.id === activeProfile?.id;
            return (
              <MenuRow
                key={p.id}
                title={p.name}
                active={active}
                onPress={() => {
                  switchProfile(p.id);
                  onClose();
                }}
              />
            );
          })}
          <Text style={[st.modalEyebrow, st.sectionEyebrow]}>УПРАВЛЕНИЕ</Text>
          <MenuRow title="Новый профиль" hint="Пустой прогресс" onPress={() => setNewProfileOpen(true)} />
          <MenuRow title="Переименовать" hint={activeProfile?.name || ''} onPress={startRename} />
          {meta.profiles.length > 1 ? (
            <MenuRow
              title="Удалить текущий"
              hint="Без возможности отмены"
              danger
              onPress={() => {
                Alert.alert('Удалить профиль?', `Удалить «${activeProfile?.name}» и все его данные?`, [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: () => {
                      if (deleteProfile(activeProfile?.id)) onClose();
                    },
                  },
                ]);
              }}
            />
          ) : null}
          <Text style={[st.modalEyebrow, st.sectionEyebrow]}>ДАННЫЕ</Text>
          <MenuRow title="Экспорт всего" hint="JSON для резервной копии" onPress={runExport} />
          <MenuRow title="Импорт" hint="Заменит текущие профили" onPress={() => setImportOpen(true)} />
        </ScrollView>
        <TouchableOpacity onPress={onClose} style={st.cancelButton}>
          <Text style={st.cancelText}>Закрыть</Text>
        </TouchableOpacity>
      </AnimatedModal>

      <AnimatedModal
        visible={newProfileOpen}
        onRequestClose={() => setNewProfileOpen(false)}
        cardStyle={[st.confirmCard, st.profileConfirmCard]}
      >
        <Text style={[st.confirmTitle, st.profileConfirmTitle]}>Новый профиль</Text>
        <TextInput
          value={newProfileName}
          onChangeText={setNewProfileName}
          placeholder="Название фермы..."
          placeholderTextColor={palette.muted}
          style={[st.modalSearch, st.profileModalInput]}
        />
        <View style={[st.confirmActions, st.profileConfirmActions]}>
          <TouchableOpacity onPress={() => setNewProfileOpen(false)} style={st.confirmCancel}>
            <Text style={st.confirmCancelText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              addProfile(newProfileName);
              setNewProfileName('');
              setNewProfileOpen(false);
              onClose();
            }}
            style={st.confirmDelete}
          >
            <Text style={st.confirmDeleteText}>Создать</Text>
          </TouchableOpacity>
        </View>
      </AnimatedModal>

      <AnimatedModal
        visible={renameOpen}
        onRequestClose={() => setRenameOpen(false)}
        cardStyle={[st.confirmCard, st.profileConfirmCard]}
      >
        <Text style={[st.confirmTitle, st.profileConfirmTitle]}>Переименовать</Text>
        <TextInput
          value={renameValue}
          onChangeText={setRenameValue}
          placeholder="Название..."
          placeholderTextColor={palette.muted}
          style={[st.modalSearch, st.profileModalInput]}
        />
        <View style={[st.confirmActions, st.profileConfirmActions]}>
          <TouchableOpacity onPress={() => setRenameOpen(false)} style={st.confirmCancel}>
            <Text style={st.confirmCancelText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (activeProfile?.id) renameProfile(activeProfile.id, renameValue);
              setRenameOpen(false);
            }}
            style={st.confirmDelete}
          >
            <Text style={st.confirmDeleteText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </AnimatedModal>

      <AnimatedModal
        visible={importOpen}
        onRequestClose={() => setImportOpen(false)}
        cardStyle={[st.modalCard, { maxHeight: '85%' }]}
      >
        <Text style={st.modalTitle}>Импорт данных</Text>
        <Text style={st.modalIntro}>Вставь JSON из экспорта. Текущие профили будут заменены.</Text>
        <TextInput
          value={importValue}
          onChangeText={setImportValue}
          placeholder="Вставь JSON сюда..."
          placeholderTextColor={palette.muted}
          style={[st.modalSearch, { minHeight: 140, textAlignVertical: 'top' }]}
          multiline
        />
        <View style={st.confirmActions}>
          <TouchableOpacity onPress={() => setImportOpen(false)} style={st.confirmCancel}>
            <Text style={st.confirmCancelText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={runImport} style={st.confirmDelete}>
            <Text style={st.confirmDeleteText}>Импортировать</Text>
          </TouchableOpacity>
        </View>
      </AnimatedModal>
    </>
  );
}