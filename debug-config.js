const loadConfig = require('@react-native-community/cli-config').default;
const config = loadConfig(process.cwd());
console.log(JSON.stringify(config, null, 2));
