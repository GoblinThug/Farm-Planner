import Constants from 'expo-constants';
import { Linking, Alert, Platform } from 'react-native';
import { githubReleasesApiUrl, githubReleasesPageUrl, APP_CONFIG } from '../config/appConfig';
import packageJson from '../../package.json';

export function getInstalledVersion() {
  return Constants.expoConfig?.version || Constants.nativeAppVersion || packageJson.version;
}

/** Compare semver-ish strings. Returns 1 if a>b, -1 if a<b, 0 if equal. */
export function compareVersions(a, b) {
  const pa = String(a)
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map(x => parseInt(x, 10) || 0);
  const pb = String(b)
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map(x => parseInt(x, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

function pickApkAsset(assets = []) {
  return assets.find(a => /\.apk$/i.test(a.name || a.browser_download_url || '')) || null;
}

/**
 * @returns {Promise<null | { latestVersion: string, currentVersion: string, updateAvailable: boolean, releaseUrl: string, apkUrl?: string, releaseName?: string, body?: string }>}
 */
export async function checkGitHubUpdate() {
  const currentVersion = getInstalledVersion();
  const res = await fetch(githubReleasesApiUrl(), {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': `${APP_CONFIG.displayName}-update-check`,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`);
  }
  const data = await res.json();
  const latestVersion = String(data.tag_name || data.name || '').replace(/^v/i, '');
  if (!latestVersion) {
    throw new Error('Не удалось прочитать версию релиза');
  }
  const apk = pickApkAsset(data.assets || []);
  const updateAvailable = compareVersions(latestVersion, currentVersion) > 0;
  return {
    currentVersion,
    latestVersion,
    updateAvailable,
    releaseUrl: data.html_url || githubReleasesPageUrl(),
    apkUrl: apk?.browser_download_url,
    releaseName: data.name,
    body: data.body,
  };
}

export async function openUpdateLink(info) {
  const url = Platform.OS === 'android' && info?.apkUrl ? info.apkUrl : info?.releaseUrl || githubReleasesPageUrl();
  let canOpen = false;
  try {
    canOpen = await Linking.canOpenURL(url);
  } catch {
    /* Android 11+ may block canOpenURL without manifest queries — fall through to openURL */
  }
  if (canOpen) {
    await Linking.openURL(url);
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    throw new Error('Не удалось открыть ссылку');
  }
}

export function promptUpdateAvailable(info, { onLater } = {}) {
  if (!info?.updateAvailable) return;
  Alert.alert(
    'Доступно обновление',
    `Установлена версия ${info.currentVersion}.\nНовая версия: ${info.latestVersion}.\n\nОбновить приложение?`,
    [
      {
        text: 'Позже',
        style: 'cancel',
        onPress: () => onLater?.(),
      },
      {
        text: 'Обновить',
        onPress: () => {
          openUpdateLink(info).catch(() => {
            Alert.alert('Ошибка', 'Не удалось открыть страницу загрузки.');
          });
        },
      },
    ]
  );
}
