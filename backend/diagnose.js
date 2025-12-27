#!/usr/bin/env node

/**
 * Comprehensive Backend Diagnostics Script
 * Run this to verify the backend is properly configured
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

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

function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'cyan');
  
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('  ❌ .env file not found!', 'red');
    log('     Run: cp .env.example .env', 'yellow');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'PORT'
  ];
  
  let allPresent = true;
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=`, 'm');
    if (regex.test(envContent)) {
      log(`  ✅ ${varName} is set`, 'green');
    } else {
      log(`  ❌ ${varName} is missing`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkPackageJson() {
  log('\n📦 Checking Package Dependencies...', 'cyan');
  
  const packagePath = path.join(__dirname, 'package.json');
  const requiredDeps = [
    'express',
    'mongoose',
    'jsonwebtoken',
    'cors',
    'dotenv'
  ];
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let allPresent = true;
    requiredDeps.forEach(dep => {
      if (allDeps[dep]) {
        log(`  ✅ ${dep} is installed`, 'green');
      } else {
        log(`  ❌ ${dep} is missing`, 'red');
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    log(`  ❌ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function checkNodeModules() {
  log('\n📂 Checking Node Modules...', 'cyan');
  
  const modulesPath = path.join(__dirname, 'node_modules');
  
  if (fs.existsSync(modulesPath)) {
    log('  ✅ node_modules directory exists', 'green');
    return true;
  } else {
    log('  ❌ node_modules directory not found', 'red');
    log('     Run: npm install', 'yellow');
    return false;
  }
}

function checkServerFile() {
  log('\n🚀 Checking Server Configuration...', 'cyan');
  
  const serverPath = path.join(__dirname, 'server.js');
  
  if (fs.existsSync(serverPath)) {
    const content = fs.readFileSync(serverPath, 'utf-8');
    
    if (content.includes('app.listen') || content.includes('startServer')) {
      log('  ✅ server.js is properly configured', 'green');
      return true;
    } else {
      log('  ❌ server.js may be missing configuration', 'red');
      return false;
    }
  } else {
    log('  ❌ server.js not found', 'red');
    return false;
  }
}

function testServerConnection() {
  log('\n🌐 Testing Server Connection...', 'cyan');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/health',
    method: 'GET'
  };
  
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        log('  ✅ Server is running on port 5001', 'green');
        resolve(true);
      } else {
        log(`  ❌ Server returned status ${res.statusCode}`, 'red');
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      log(`  ❌ Server is not running: ${error.message}`, 'red');
      log('     Start the server with: npm run dev', 'yellow');
      resolve(false);
    });
    
    req.on('timeout', () => {
      log('  ❌ Server connection timed out', 'red');
      resolve(false);
    });
    
    req.setTimeout(5000);
    req.end();
  });
}

async function runDiagnostics() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║   French Master Backend Diagnostics', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  let allChecksPassed = true;
  
  // Check environment variables
  if (!checkEnvironmentVariables()) allChecksPassed = false;
  
  // Check package.json
  if (!checkPackageJson()) allChecksPassed = false;
  
  // Check node_modules
  if (!checkNodeModules()) allChecksPassed = false;
  
  // Check server file
  if (!checkServerFile()) allChecksPassed = false;
  
  // Test server connection
  const serverRunning = await testServerConnection();
  if (!serverRunning) allChecksPassed = false;
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  if (allChecksPassed) {
    log('║   ✅ All checks passed! Backend is ready.', 'green');
    log('║', 'blue');
    log('║   Run: npm run dev', 'cyan');
    log('║   OR:  npm start', 'cyan');
  } else {
    log('║   ⚠️  Some checks failed. See above for details.', 'yellow');
  }
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  
  process.exit(allChecksPassed ? 0 : 1);
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`\n❌ Diagnostic failed: ${error.message}`, 'red');
  process.exit(1);
});
