# Font Download Instructions

## Required Fonts for Sprytna Spiżarnia

To complete the font setup, download the following fonts and place them in this directory:

### 1. Inter Font Family
**Download from:** https://fonts.google.com/specimen/Inter
**License:** SIL Open Font License
**Files needed:**
- `Inter-Regular.ttf` (400 weight)
- `Inter-Medium.ttf` (500 weight) 
- `Inter-SemiBold.ttf` (600 weight)
- `Inter-Bold.ttf` (700 weight)

### 2. Roboto Font Family (Fallback)
**Download from:** https://fonts.google.com/specimen/Roboto
**License:** Apache License 2.0
**Files needed:**
- `Roboto-Regular.ttf` (400 weight)
- `Roboto-Medium.ttf` (500 weight)
- `Roboto-Bold.ttf` (700 weight)

### 3. Material Icons
**Download from:** https://fonts.google.com/icons
**License:** Apache License 2.0
**File needed:**
- `MaterialIcons-Regular.ttf`

## Installation Steps

### For React Native CLI:
1. Download fonts and place in `assets/fonts/`
2. Add to `react-native.config.js`:
```javascript
module.exports = {
  assets: ['./assets/fonts/'],
};
```
3. Run: `npx react-native link`

### For Expo:
1. Install expo-font: `npm install expo-font`
2. Load fonts in App.js:
```javascript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
});
```

### For Android (manual):
Copy fonts to: `android/app/src/main/assets/fonts/`

### For iOS (manual):
1. Add fonts to Xcode project
2. Update Info.plist with font names

## Font Usage in Styles

```javascript
const styles = StyleSheet.create({
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
  },
  subheading: {
    fontFamily: 'Inter-SemiBold', 
    fontSize: 18,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  caption: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
```

## Status: ⏳ Fonts need to be downloaded manually
**Reason:** Font files are copyrighted and must be downloaded from official sources.
