import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnimatedModal } from './AnimatedModal';
import { ConfirmDialog } from './ConfirmDialog';
import { useTheme } from '../context/ThemeContext';
import {
  checkGitHubUpdate,
  getInstalledVersion,
  openUpdateLink,
} from '../utils/appVersion';
import { APP_CONFIG } from '../config/appConfig';

function SettingRow({ icon, title, hint, onPress, right, st, palette }) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={st.navMenuRow}
    >
      <View style={st.settingsIconWrap}>
        <Feather name={icon} size={18} color={palette.greenDark} />
      </View>
      <View style={st.flex1}>
        <Text style={st.navMenuRowTitle}>{title}</Text>
        {hint ? <Text style={st.navMenuRowHint}>{hint}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export function SettingsModal({ visible, onClose }) {
  const { st, palette, mode, setMode } = useTheme();
  const [checking, setChecking] = useState(false);
  const [dialog, setDialog] = useState(null);
  const version = getInstalledVersion();

  const closeDialog = () => setDialog(null);

  const runUpdateCheck = async () => {
    setChecking(true);
    try {
      const info = await checkGitHubUpdate();
      if (info.updateAvailable) {
        setDialog({
          kind: 'update',
          title: 'Доступно обновление',
          message: `Установлена версия ${info.currentVersion}.\nНовая версия: ${info.latestVersion}.\n\nОткрыть страницу загрузки?`,
          info,
        });
      } else {
        setDialog({
          kind: 'current',
          title: 'Обновлений нет',
          message: `У вас актуальная версия ${info.currentVersion}.`,
        });
      }
    } catch (e) {
      setDialog({
        kind: 'error',
        title: 'Не удалось проверить',
        message: e?.message || 'Проверь интернет и попробуй снова.',
      });
    } finally {
      setChecking(false);
    }
  };

  const openReleases = async () => {
    try {
      await openUpdateLink({
        releaseUrl: `https://github.com/${APP_CONFIG.github.owner}/${APP_CONFIG.github.repo}/releases/latest`,
      });
    } catch {
      setDialog({
        kind: 'error',
        title: 'Ошибка',
        message: 'Не удалось открыть GitHub.',
      });
    }
  };

  const dialogTone = dialog?.kind === 'current' ? 'ok' : dialog?.kind === 'update' ? 'neutral' : 'warn';
  const dialogIcon =
    dialog?.kind === 'current' ? 'check-circle' : dialog?.kind === 'update' ? 'download-cloud' : 'alert-circle';

  return (
    <>
      <AnimatedModal visible={visible} onRequestClose={onClose} cardStyle={st.navMenuCard}>
        <View style={st.modalHeader}>
          <View style={st.flex1}>
            <Text style={st.modalEyebrow}>ПРИЛОЖЕНИЕ</Text>
            <Text style={st.navMenuTitle}>Настройки</Text>
            <Text style={st.modalIntro}>
              Тема оформления и проверка обновлений с GitHub ({APP_CONFIG.github.owner}/{APP_CONFIG.github.repo}).
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={st.closeButton} accessibilityLabel="Закрыть настройки">
            <Feather name="x" size={22} color={palette.ink} />
          </TouchableOpacity>
        </View>

        <Text style={[st.modalEyebrow, st.sectionEyebrowTight]}>ОФОРМЛЕНИЕ</Text>
        <View style={st.themeToggleRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMode('light')}
            style={[st.themeOption, mode === 'light' && st.themeOptionOn]}
          >
            <Feather name="sun" size={18} color={mode === 'light' ? palette.greenDark : palette.muted} />
            <Text style={[st.themeOptionText, mode === 'light' && st.btnTextOn]}>Светлая</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setMode('dark')}
            style={[st.themeOption, mode === 'dark' && st.themeOptionOn]}
          >
            <Feather name="moon" size={18} color={mode === 'dark' ? palette.greenDark : palette.muted} />
            <Text style={[st.themeOptionText, mode === 'dark' && st.btnTextOn]}>Тёмная</Text>
          </TouchableOpacity>
        </View>

        <Text style={[st.modalEyebrow, st.sectionEyebrow]}>ОБНОВЛЕНИЯ</Text>
        <SettingRow
          st={st}
          palette={palette}
          icon="info"
          title={`Версия ${version}`}
          hint="Установленная сборка"
        />
        <SettingRow
          st={st}
          palette={palette}
          icon="download-cloud"
          title="Проверить обновления"
          hint="Смотрим последний релиз на GitHub"
          onPress={() => runUpdateCheck()}
          right={
            checking ? (
              <ActivityIndicator color={palette.greenDark} />
            ) : (
              <Feather name="chevron-right" size={18} color={palette.muted} />
            )
          }
        />
        <SettingRow
          st={st}
          palette={palette}
          icon="external-link"
          title="Страница релизов"
          hint="Открыть GitHub Releases"
          onPress={openReleases}
          right={<Feather name="chevron-right" size={18} color={palette.muted} />}
        />

        <TouchableOpacity onPress={onClose} style={st.cancelButton}>
          <Text style={st.cancelText}>Закрыть</Text>
        </TouchableOpacity>
      </AnimatedModal>

      <ConfirmDialog
        visible={!!dialog}
        onRequestClose={closeDialog}
        eyebrow="ОБНОВЛЕНИЯ"
        title={dialog?.title}
        message={dialog?.message}
        icon={dialogIcon}
        tone={dialogTone}
        secondaryLabel={dialog?.kind === 'update' ? 'Позже' : undefined}
        onSecondary={closeDialog}
        primaryLabel={dialog?.kind === 'update' ? 'Обновить' : 'Понятно'}
        onPrimary={async () => {
          if (dialog?.kind === 'update' && dialog.info) {
            try {
              await openUpdateLink(dialog.info);
              closeDialog();
            } catch {
              setDialog({
                kind: 'error',
                title: 'Ошибка',
                message: 'Не удалось открыть страницу загрузки.',
              });
            }
            return;
          }
          closeDialog();
        }}
      />
    </>
  );
}
