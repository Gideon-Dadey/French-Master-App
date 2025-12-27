#!/usr/bin/env node

/**
 * Frontend Configuration Validator
 * Ensures the app uses correct API URLs for mobile
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateApiConfig() {
  log('\n📋 Validating API Configuration...', 'cyan');
  
  const apiPath = path.join(__dirname, 'src', 'services', 'api.js');
  
  if (!fs.existsSync(apiPath)) {
    log('  ❌ API config file not found at ' + apiPath, 'red');
    return false;
  }
  
  const content = fs.readFileSync(apiPath, 'utf-8');
  
  // Check for production URL
  if (content.includes('api.frenchmastergh.com')) {
    log('  ✅ Production URL is configured', 'green');
  } else {
    log('  ⚠️  Production URL not found (may use local URL)', 'yellow');
  }
  
  // Check for proper USE_LOCAL flag
  if (content.includes('USE_LOCAL = false')) {
    log('  ✅ USE_LOCAL is set to false (production mode)', 'green');
    return true;
  } else if (content.includes('USE_LOCAL = true')) {
    log('  ⚠️  USE_LOCAL is set to true (local development mode)', 'yellow');
    log('     This will NOT work on mobile!', 'red');
    return false;
  } else {
    log('  ⚠️  Cannot find USE_LOCAL flag', 'yellow');
    return null;
  }
}

function validateEnvironmentSetup() {
  log('\n📱 Validating Mobile Setup...', 'cyan');
  
  const filesToCheck = [
    'src/context/AuthContext.js',
    'screens/Auth/LoginScreen.js',
    'screens/LearnScreen.js',
    'screens/LearnerHomeScreen.js',
    'screens/StudyGroupsScreen.js',
  ];
  
  const appJsPath = path.join(__dirname, 'App.js');
  
  if (!fs.existsSync(appJsPath)) {
    log('  ❌ App.js not found', 'red');
    return false;
  }
  
  log('  ✅ App.js exists', 'green');
  
  let allValid = true;
  filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('Promise.allSettled') || content.includes('.catch')) {
        log(`  ✅ ${file.split('/').pop()} has error handling`, 'green');
      } else {
        log(`  ⚠️  ${file.split('/').pop()} may need error handling`, 'yellow');
      }
    } else {
      log(`  ⚠️  ${file} not found`, 'yellow');
    }
  });
  
  return allValid;
}

function checkPackageJson() {
  log('\n📦 Checking Dependencies...', 'cyan');
  
  const packagePath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    log('  ❌ package.json not found', 'red');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const requiredDeps = [
    'axios',
    'expo-secure-store',
    'react-native',
    'expo'
  ];
  
  let allPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      log(`  ✅ ${dep} is available`, 'green');
    } else {
      log(`  ⚠️  ${dep} is not listed`, 'yellow');
      allPresent = false;
    }
  });
  
  return allPresent;
}

async function validate() {
  log('\n╔═════════════════════════════════════════════════════════╗', 'blue');
  log('║   Frontend Mobile Configuration Validator', 'blue');
  log('╚═════════════════════════════════════════════════════════╝', 'blue');
  
  let allValid = true;
  
  // Validate API config
  const apiValid = validateApiConfig();
  if (apiValid === false) allValid = false;
  
  // Validate mobile setup
  const mobileValid = validateEnvironmentSetup();
  if (!mobileValid) allValid = false;
  
  // Check dependencies
  const depsValid = checkPackageJson();
  if (!depsValid) allValid = false;
  
  // Summary
  log('\n╔═════════════════════════════════════════════════════════╗', 'blue');
  if (allValid) {
    log('║   ✅ Frontend is properly configured for mobile!', 'green');
    log('║', 'blue');
    log('║   Next steps:', 'cyan');
    log('║   1. Ensure backend is running: npm run dev (in backend/)', 'cyan');
    log('║   2. Start app: expo start', 'cyan');
    log('║   3. Scan QR code with phone', 'cyan');
  } else {
    log('║   ⚠️  Some validations failed. See above.', 'yellow');
    log('║', 'blue');
    log('║   Required action:', 'cyan');
    log('║   Set USE_LOCAL = false in src/services/api.js', 'cyan');
  }
  log('╚═════════════════════════════════════════════════════════╝', 'blue');
}

validate().catch(error => {
  log(`\n❌ Validation failed: ${error.message}`, 'red');
  process.exit(1);
});
