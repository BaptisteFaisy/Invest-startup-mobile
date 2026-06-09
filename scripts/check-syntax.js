const babel = require('@babel/core');
const fs    = require('fs');
const path  = require('path');

const files = [
  'App.js',
  'src/contexts/AuthContext.js',
  'src/services/api.js',
  'src/navigation/AppNavigator.js',
  'src/screens/HomeScreen.js',
  'src/screens/StartupsScreen.js',
  'src/screens/StartupDetailScreen.js',
  'src/screens/LoginScreen.js',
  'src/screens/RegisterScreen.js',
  'src/screens/InvestmentsScreen.js',
  'src/screens/ProfileScreen.js',
  'src/screens/HowItWorksScreen.js',
];

let allOk = true;
for (const f of files) {
  try {
    babel.parseSync(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), {
      filename: f,
      presets: [['babel-preset-expo']],
      rootMode: 'upward',
    });
    console.log('OK  ', f);
  } catch (e) {
    console.log('ERR ', f, '->', e.message.split('\n')[0]);
    allOk = false;
  }
}

process.exit(allOk ? 0 : 1);
