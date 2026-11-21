const { withAndroidManifest } = require('expo/config-plugins');

/** Android 11+ package visibility — allows Linking for https/http URLs (updates, GitHub releases). */
function withAndroidLinkingQueries(config) {
  return withAndroidManifest(config, config => {
    const manifest = config.modResults.manifest;
    const existing = manifest.queries ?? [];
    const viewHttps = {
      intent: [
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
          data: [{ $: { 'android:scheme': 'https', 'android:host': '*' } }],
        },
        {
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          data: [{ $: { 'android:scheme': 'http' } }],
        },
      ],
    };
    manifest.queries = [...existing, viewHttps];
    return config;
  });
}

module.exports = withAndroidLinkingQueries;