const appJson = require('./app.json');
const packageJson = require('./package.json');

module.exports = {
  expo: {
    ...appJson.expo,
    version: packageJson.version,
    plugins: [...(appJson.expo.plugins || []), './plugins/withAndroidLinkingQueries.js'],
  },
};