import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PROFILE_META_KEY,
  LEGACY_PLANTINGS_KEY,
  LEGACY_CAUGHT_KEY,
  EXPORT_SCHEMA_VERSION,
  profileSaveKey,
  createEmptySave,
  createProfile,
  normalizeSave,
} from '../storage/profileSave';

const ProfileContext = createContext(null);

const defaultMeta = () => ({
  version: 1,
  activeProfileId: null,
  profiles: [],
});

export function ProfileProvider({ children }) {
  const [meta, setMeta] = useState(defaultMeta());
  const [saves, setSaves] = useState({});
  const [ready, setReady] = useState(false);
  const metaReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rawMeta = await AsyncStorage.getItem(PROFILE_META_KEY);
        let nextMeta = rawMeta ? { ...defaultMeta(), ...JSON.parse(rawMeta) } : null;

        if (!nextMeta?.profiles?.length) {
          const legacyPlantings = await AsyncStorage.getItem(LEGACY_PLANTINGS_KEY);
          const legacyCaught = await AsyncStorage.getItem(LEGACY_CAUGHT_KEY);
          const first = createProfile('Ферма 1');
          nextMeta = { version: 1, activeProfileId: first.id, profiles: [first] };
          const save = createEmptySave();
          if (legacyPlantings) {
            try {
              save.plantings = JSON.parse(legacyPlantings).map(p => ({ ...p, year: p.year || 1 }));
            } catch {
              /* ignore */
            }
          }
          if (legacyCaught) {
            try {
              save.caughtFish = JSON.parse(legacyCaught);
            } catch {
              /* ignore */
            }
          }
          await AsyncStorage.setItem(profileSaveKey(first.id), JSON.stringify(save));
          await AsyncStorage.setItem(PROFILE_META_KEY, JSON.stringify(nextMeta));
          if (cancelled) return;
          setMeta(nextMeta);
          setSaves({ [first.id]: save });
          setReady(true);
          metaReadyRef.current = true;
          return;
        }

        const loaded = {};
        for (const p of nextMeta.profiles) {
          const raw = await AsyncStorage.getItem(profileSaveKey(p.id));
          loaded[p.id] = raw ? normalizeSave(JSON.parse(raw)) : createEmptySave();
        }
        if (!nextMeta.activeProfileId && nextMeta.profiles[0]) {
          nextMeta.activeProfileId = nextMeta.profiles[0].id;
        }
        if (cancelled) return;
        setMeta(nextMeta);
        setSaves(loaded);
        setReady(true);
        metaReadyRef.current = true;
      } catch {
        if (cancelled) return;
        const first = createProfile('Ферма 1');
        const fallbackMeta = { version: 1, activeProfileId: first.id, profiles: [first] };
        setMeta(fallbackMeta);
        setSaves({ [first.id]: createEmptySave() });
        setReady(true);
        metaReadyRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !metaReadyRef.current) return;
    AsyncStorage.setItem(PROFILE_META_KEY, JSON.stringify(meta)).catch(() => {});
  }, [meta, ready]);

  const persistSave = useCallback((profileId, save) => {
    AsyncStorage.setItem(profileSaveKey(profileId), JSON.stringify(save)).catch(() => {});
  }, []);

  const activeProfileId = meta.activeProfileId;
  const activeProfile = useMemo(
    () => meta.profiles.find(p => p.id === activeProfileId) || meta.profiles[0] || null,
    [meta.profiles, activeProfileId]
  );

  const activeSave = saves[activeProfileId] ?? createEmptySave();

  const updateActiveSave = useCallback(
    updater => {
      if (!activeProfileId) return;
      setSaves(prev => {
        const current = prev[activeProfileId] ?? createEmptySave();
        const next = typeof updater === 'function' ? normalizeSave(updater(current)) : normalizeSave({ ...current, ...updater });
        persistSave(activeProfileId, next);
        return { ...prev, [activeProfileId]: next };
      });
    },
    [activeProfileId, persistSave]
  );

  const switchProfile = useCallback(id => {
    if (!meta.profiles.some(p => p.id === id)) return;
    setMeta(m => ({ ...m, activeProfileId: id }));
  }, [meta.profiles]);

  const addProfile = useCallback(
    name => {
      const profile = createProfile(name || `Ферма ${meta.profiles.length + 1}`);
      setMeta(m => ({ ...m, activeProfileId: profile.id, profiles: [...m.profiles, profile] }));
      const empty = createEmptySave();
      setSaves(s => ({ ...s, [profile.id]: empty }));
      persistSave(profile.id, empty);
      return profile;
    },
    [meta.profiles.length, persistSave]
  );

  const renameProfile = useCallback((id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setMeta(m => ({
      ...m,
      profiles: m.profiles.map(p => (p.id === id ? { ...p, name: trimmed } : p)),
    }));
  }, []);

  const deleteProfile = useCallback(
    id => {
      if (meta.profiles.length <= 1) return false;
      setMeta(m => {
        const profiles = m.profiles.filter(p => p.id !== id);
        const activeProfileId = m.activeProfileId === id ? profiles[0]?.id : m.activeProfileId;
        return { ...m, profiles, activeProfileId };
      });
      setSaves(s => {
        const next = { ...s };
        delete next[id];
        return next;
      });
      AsyncStorage.removeItem(profileSaveKey(id)).catch(() => {});
      return true;
    },
    [meta.profiles.length]
  );

  const exportAllData = useCallback(() => {
    return JSON.stringify(
      {
        schemaVersion: EXPORT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        meta: { version: meta.version, activeProfileId: meta.activeProfileId, profiles: meta.profiles },
        saves,
      },
      null,
      2
    );
  }, [meta, saves]);

  const importAllData = useCallback(
    jsonText => {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') throw new Error('Неверный формат');
      if (parsed.schemaVersion !== EXPORT_SCHEMA_VERSION) throw new Error('Неподдерживаемая версия экспорта');
      const incomingMeta = parsed.meta;
      if (!incomingMeta?.profiles?.length) throw new Error('В файле нет профилей');
      const incomingSaves = parsed.saves || {};
      const normalized = {};
      for (const p of incomingMeta.profiles) {
        normalized[p.id] = normalizeSave(incomingSaves[p.id]);
        persistSave(p.id, normalized[p.id]);
      }
      setMeta({
        version: incomingMeta.version || 1,
        activeProfileId: incomingMeta.activeProfileId || incomingMeta.profiles[0].id,
        profiles: incomingMeta.profiles,
      });
      setSaves(normalized);
      return incomingMeta.profiles.length;
    },
    [persistSave]
  );

  const value = useMemo(
    () => ({
      ready,
      meta,
      saves,
      activeProfile,
      activeProfileId,
      activeSave,
      switchProfile,
      addProfile,
      renameProfile,
      deleteProfile,
      updateActiveSave,
      exportAllData,
      importAllData,
    }),
    [
      ready,
      meta,
      saves,
      activeProfile,
      activeProfileId,
      activeSave,
      switchProfile,
      addProfile,
      renameProfile,
      deleteProfile,
      updateActiveSave,
      exportAllData,
      importAllData,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export function useActiveProfileSave() {
  const { ready, activeSave, updateActiveSave, activeProfileId } = useProfile();
  return { ready, save: activeSave, setSave: updateActiveSave, profileId: activeProfileId };
}