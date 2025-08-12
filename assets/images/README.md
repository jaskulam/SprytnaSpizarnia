# Images for Sprytna Spiżarnia

## App Icons & Branding

### App Icon
- **Size**: 1024x1024px (master icon)
- **Format**: PNG with transparency
- **Design**: Green pantry/kitchen theme with modern flat design
- **File**: `app-icon.png`

### Logo Variations
- `logo-full.png` - Full logo with text (horizontal)
- `logo-mark.png` - Icon only (square)
- `logo-white.png` - White version for dark backgrounds
- `logo-small.png` - Small version for headers (32x32)

### Splash Screen
- `splash-bg.png` - Background pattern/texture
- `splash-logo.png` - Centered logo for splash screen

## UI Graphics

### Illustrations
- `empty-pantry.png` - When pantry is empty
- `empty-shopping-list.png` - When shopping list is empty
- `empty-recipes.png` - When no recipes found
- `success-illustration.png` - Success states
- `error-illustration.png` - Error states

### Category Icons
- `category-fruits.png` - Fruits & vegetables
- `category-dairy.png` - Dairy products
- `category-meat.png` - Meat & fish
- `category-grains.png` - Grains & cereals
- `category-beverages.png` - Beverages
- `category-snacks.png` - Snacks & sweets
- `category-frozen.png` - Frozen foods
- `category-canned.png` - Canned goods
- `category-spices.png` - Spices & herbs
- `category-cleaning.png` - Cleaning products

### Onboarding
- `onboarding-1.png` - Scan products
- `onboarding-2.png` - Track expiry dates
- `onboarding-3.png` - Share with family
- `onboarding-4.png` - Get recipes

### Background Elements
- `pattern-subtle.png` - Subtle background pattern
- `gradient-overlay.png` - Gradient overlays
- `card-shadow.png` - Drop shadow for cards

## Icons (SVG preferred, PNG fallback)

### Navigation Icons
- `home-icon.svg` / `home-icon.png`
- `pantry-icon.svg` / `pantry-icon.png` 
- `shopping-icon.svg` / `shopping-icon.png`
- `recipes-icon.svg` / `recipes-icon.png`
- `profile-icon.svg` / `profile-icon.png`

### Action Icons
- `scan-icon.svg` / `scan-icon.png`
- `add-icon.svg` / `add-icon.png`
- `edit-icon.svg` / `edit-icon.png`
- `delete-icon.svg` / `delete-icon.png`
- `share-icon.svg` / `share-icon.png`
- `favorite-icon.svg` / `favorite-icon.png`
- `notification-icon.svg` / `notification-icon.png`
- `settings-icon.svg` / `settings-icon.png`

### Status Icons
- `expired-icon.svg` / `expired-icon.png`
- `expiring-soon-icon.svg` / `expiring-soon-icon.png`
- `fresh-icon.svg` / `fresh-icon.png`
- `checkmark-icon.svg` / `checkmark-icon.png`
- `warning-icon.svg` / `warning-icon.png`
- `info-icon.svg` / `info-icon.png`

## Placeholder Images

### Product Placeholders
- `product-placeholder.png` - Default product image
- `product-no-image.png` - When no image available

### User Placeholders
- `avatar-placeholder.png` - Default user avatar
- `family-placeholder.png` - Family member placeholder

## Export Guidelines

### Sizes for React Native
Export icons in multiple sizes:
- @1x (baseline)
- @2x (2x resolution)
- @3x (3x resolution)

### Example naming:
- `home-icon.png` (1x)
- `home-icon@2x.png` (2x)  
- `home-icon@3x.png` (3x)

### Recommended sizes:
- Small icons: 24x24dp (24/48/72px)
- Medium icons: 32x32dp (32/64/96px)
- Large icons: 48x48dp (48/96/144px)
- App icon: 512x512dp (512/1024/1536px)

## Color Palette Reference

Use these colors in your designs:
- Primary Green: #4CAF50
- Primary Dark: #388E3C
- Primary Light: #81C784
- Accent Orange: #FF9800
- Warning: #FF9800
- Error: #F44336
- Success: #4CAF50
- Info: #2196F3

## Design Tools

### Recommended software:
- **Figma** (UI design)
- **Adobe Illustrator** (icons/vectors)
- **Adobe Photoshop** (image editing)
- **Sketch** (UI design - Mac only)

### Free alternatives:
- **GIMP** (image editing)
- **Inkscape** (vector graphics)
- **Canva** (simple graphics)

## Asset Optimization

### Before adding to project:
1. **Compress images** using TinyPNG or similar
2. **Optimize SVGs** using SVGO
3. **Use WebP format** when possible for better compression
4. **Remove unused assets** to reduce bundle size

## Usage in React Native

```javascript
// Local images
import AppIcon from '../assets/images/app-icon.png';
import EmptyPantry from '../assets/images/empty-pantry.png';

// In JSX
<Image source={AppIcon} style={styles.icon} />
<Image source={EmptyPantry} style={styles.illustration} />

// Dynamic images (for user photos, product images)
<Image source={{uri: imageUrl}} style={styles.productImage} />
```
