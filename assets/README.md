# Assets - Sprytna Spiżarnia

Folder zawiera wszystkie zasoby graficzne i fonty używane w aplikacji React Native.

## 📁 Struktura folderów

```
assets/
├── fonts/                    # Fonty aplikacji
├── images/                   # Obrazy i ikony
│   ├── branding/             # Logo i branding
│   ├── categories/           # Ikony kategorii produktów
│   ├── icons/                # Ikony interfejsu
│   ├── illustrations/        # Ilustracje dla stanów pustych
│   ├── onboarding/           # Obrazy dla onboardingu
│   └── placeholders/         # Placeholder obrazy
├── index.js                  # Centralne importy zasobów
└── README.md                 # Ten plik
```

## 🎨 Zasoby graficzne

### Branding
- ✅ `app-icon.svg` - Ikona aplikacji (64x64)
- ✅ `logo-full.svg` - Pełne logo z tekstem 
- ✅ `logo-white.svg` - Białe logo na ciemne tła

### Ikony nawigacji
- ✅ `home-icon.svg` - Strona główna
- ✅ `pantry-icon.svg` - Spiżarnia
- ✅ `shopping-icon.svg` - Lista zakupów
- ✅ `recipes-icon.svg` - Przepisy
- ✅ `profile-icon.svg` - Profil użytkownika

### Ikony statusu
- ✅ `fresh-icon.svg` - Produkt świeży
- ✅ `expired-icon.svg` - Produkt przeterminowany  
- ✅ `warning-icon.svg` - Ostrzeżenie
- ✅ `checkmark-icon.svg` - Potwierdzenie

### Ikony kategorii
- ✅ `category-fruits.svg` - Owoce i warzywa
- ✅ `category-dairy.svg` - Nabiał
- ✅ `category-meat.svg` - Mięso i ryby
- ✅ `category-grains.svg` - Zboża i kasze
- ✅ `category-beverages.svg` - Napoje

### Ilustracje
- ✅ `empty-pantry.svg` - Pusta spiżarnia
- ✅ `empty-shopping-list.svg` - Pusta lista zakupów

### Placeholder obrazy
- ✅ `product-placeholder.svg` - Domyślny obraz produktu
- ✅ `avatar-placeholder.svg` - Domyślny avatar użytkownika

## 🔤 Fonty

### Zalecane fonty do pobrania:
- **Inter** - Główny font UI (Regular, Medium, SemiBold, Bold)
- **Roboto** - Font zapasowy (Regular, Medium, Bold)
- **Material Icons** - Ikony systemowe

## 📱 Użycie w React Native

### Import zasobów:
```javascript
import Assets from './assets';
import { NavigationIcons, StatusIcons } from './assets';

// Użycie w komponencie
<Image source={Assets.NavigationIcons.Home} style={styles.icon} />
<Image source={StatusIcons.Fresh} style={styles.statusIcon} />
```

### Responsywność:
Dla React Native zaleca się eksport ikon w formatach:
- `@1x` - 24x24px (bazowy)
- `@2x` - 48x48px (2x)
- `@3x` - 72x72px (3x)

## 🎯 Status implementacji

| Kategoria | Status | Pliki |
|-----------|---------|-------|
| Branding | ✅ Gotowe | 3/3 |
| Nawigacja | ✅ Gotowe | 5/5 |
| Status | ✅ Gotowe | 6/6 |
| Kategorie | ✅ Gotowe | 10/10 |
| Akcje | ✅ Gotowe | 8/8 |
| Ilustracje | ✅ Częściowo | 2/5 |
| Placeholders | ✅ Gotowe | 2/3 |
| Fonty | ⏳ Do pobrania | 0/8 |

## 📝 Następne kroki

### ✅ Priorytet wysoki - UKOŃCZONE:
1. **✅ Dodane instrukcje fontów** (DOWNLOAD_INSTRUCTIONS.md)
2. **✅ Uzupełnione ikony kategorii** (wszystkie 10 kategorii)
3. **✅ Dodane ikony akcji** (edit, delete, share, favorite, settings, notification)

### Priorytet średni:
4. **Uzupełnić ilustracje** (success, error, empty-recipes)
5. **Dodać obrazy onboardingu** (4 kroki)
6. **Eksportować ikony w formatach @2x, @3x**

### Priorytet niski:
7. **Dodać animowane wersje ikon** (Lottie)
8. **Optymalizować rozmiary plików** (SVGO)
9. **Dodać dark mode variants**

## 🛠️ Narzędzia

### Do tworzenia grafik:
- **Figma** - Design UI/UX
- **Adobe Illustrator** - Ikony wektorowe
- **SVGO** - Optymalizacja SVG

### Do optymalizacji:
- **TinyPNG** - Kompresja PNG
- **SVGO** - Optymalizacja SVG
- **ImageOptim** - Ogólna optymalizacja

## 📋 Wytyczne projektowe

### Kolory brandu:
- Primary Green: `#4CAF50`
- Primary Dark: `#388E3C` 
- Primary Light: `#81C784`
- Accent Orange: `#FF9800`

### Rozmiary ikon:
- Small: 16x16dp
- Medium: 24x24dp  
- Large: 32x32dp
- XLarge: 48x48dp

### Style:
- **Outline style** dla ikon nawigacji
- **Filled style** dla ikon statusu
- **Rounded corners** (8px radius)
- **2px stroke width** dla outline ikon

---

**Uwaga**: Pliki SVG w tym folderze są przykładowymi placeholder'ami. Dla produkcji zaleca się stworzenie profesjonalnych grafik zgodnych z brand guidelines aplikacji.
