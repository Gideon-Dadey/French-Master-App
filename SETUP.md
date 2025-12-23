# Quick Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **npm** or **yarn** package manager
3. **Expo CLI** - Install globally: `npm install -g expo-cli`
4. **Expo Go App** on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd "FRENCH MASTER"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - Open the Expo Go app on your phone
   - Scan the QR code displayed in the terminal or browser
   - The app will load on your device

## Running on Simulators/Emulators

### iOS Simulator (macOS only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## Project Structure

```
FRENCH MASTER/
├── App.js                 # Main entry point with navigation setup
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── babel.config.js       # Babel configuration
├── screens/              # All screen components
│   ├── HomeScreen.js
│   ├── CourseListScreen.js
│   ├── StudyInFranceScreen.js
│   ├── ResourcesScreen.js
│   ├── ContactScreen.js
│   ├── AboutScreen.js
│   ├── LessonsNewsScreen.js
│   └── ShopScreen.js
├── components/           # Reusable components
│   └── ServiceCard.js
└── assets/              # Images, icons, etc.
```

## Features Implemented

✅ Home screen with service overview
✅ Course listing with search functionality
✅ Study in France information
✅ Resources and teaching materials
✅ Contact form
✅ About page with team information
✅ Lessons & News section
✅ Shop for learning materials
✅ Bottom tab navigation
✅ Stack navigation for nested screens

## Customization

### Adding Assets

Place your app assets in the `assets/` directory:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1242x2436)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

### Modifying Colors

The primary color used throughout the app is `#1E88E5` (blue). You can find and replace this color in:
- Screen header backgrounds
- Button colors
- Icon colors
- Accent colors

## Troubleshooting

### Common Issues

1. **"Module not found" errors:**
   - Delete `node_modules` folder
   - Run `npm install` again

2. **Metro bundler issues:**
   - Clear cache: `expo start -c`
   - Or: `npm start -- --reset-cache`

3. **Port already in use:**
   - Kill the process using port 19000
   - Or use a different port: `expo start --port 8081`

## Next Steps

1. Add your actual app assets (icons, splash screens)
2. Connect to your backend API (if applicable)
3. Implement user authentication
4. Add push notifications
5. Configure app store listings
6. Set up analytics and crash reporting

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [React Native Documentation](https://reactnative.dev/)

