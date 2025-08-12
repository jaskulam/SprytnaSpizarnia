# Fonts for Sprytna Spiżarnia

## Recommended Font Stack

### Primary Font: Inter
- **Usage**: Main UI text, headings, buttons
- **Files needed**:
  - `Inter-Regular.ttf` (400)
  - `Inter-Medium.ttf` (500)
  - `Inter-SemiBold.ttf` (600)
  - `Inter-Bold.ttf` (700)

### Secondary Font: Roboto (Fallback)
- **Usage**: System text, body content
- **Files needed**:
  - `Roboto-Regular.ttf` (400)
  - `Roboto-Medium.ttf` (500)
  - `Roboto-Bold.ttf` (700)

### Icon Font: Material Icons
- **Usage**: Icons throughout the app
- **Files needed**:
  - `MaterialIcons-Regular.ttf`

## Font Configuration

Add fonts to your React Native project:

```javascript
// In your React Native project
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
    'MaterialIcons': require('./assets/fonts/MaterialIcons-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return <YourApp />;
}
```

## Download Sources

### Inter Font
- Download from: https://fonts.google.com/specimen/Inter
- License: SIL Open Font License

### Roboto Font  
- Download from: https://fonts.google.com/specimen/Roboto
- License: Apache License

### Material Icons
- Download from: https://fonts.google.com/icons
- License: Apache License

## Android Configuration

Add to `android/app/src/main/assets/fonts/` as well for Android compatibility.

## iOS Configuration

Add fonts to `ios/[ProjectName]/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
    <string>Inter-Regular.ttf</string>
    <string>Inter-Medium.ttf</string>
    <string>Inter-SemiBold.ttf</string>
    <string>Inter-Bold.ttf</string>
    <string>Roboto-Regular.ttf</string>
    <string>Roboto-Medium.ttf</string>
    <string>Roboto-Bold.ttf</string>
    <string>MaterialIcons-Regular.ttf</string>
</array>
```
