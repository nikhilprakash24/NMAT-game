# NMAT Game - Mobile App

Beautiful React Native mobile app with handwritten card aesthetic.

## 🎨 Design Philosophy

The app is designed to feel like **playing the game on vintage index cards**, with:
- Handwritten fonts (Caveat, Patrick Hand)
- Warm, nostalgic paper tones (cream, yellow, pink)
- Card-based UI with subtle shadows
- Smooth, delightful animations
- Ink-like text colors

## 📱 Features

### UI Components
- **Card** - Looks like physical index cards with texture
- **HandwrittenText** - Beautiful handwritten fonts
- **Button** - Hand-drawn style buttons
- **LinedInput** - Input that looks like writing on lined paper

### Screens
- **Welcome** - Animated welcome with staggered entrance
- **GamePlay** - Cards slide in, letter bounces, handwritten inputs
- **Lobby** - (Coming soon)
- **Results** - (Coming soon)

### Animations
- Staggered card entrances (slide + rotate)
- Bouncing letter display
- Smooth transitions between screens
- Scale/fade effects

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## 🎨 Theme Structure

```
theme/
├── colors.ts      - Vintage paper and ink colors
├── typography.ts  - Handwritten fonts
├── spacing.ts     - Consistent spacing + shadows
└── index.ts       - Main theme export
```

### Color Palette
- **Cream backgrounds** (#FFF8E7) - Aged paper feel
- **Card colors** - Yellow, pink, blue, green index cards
- **Ink colors** - Dark blue-grey for handwriting
- **Accents** - Gold, bronze, silver for winners

## 📐 Component Architecture

```
components/
├── Card.tsx              - Index card component
├── HandwrittenText.tsx   - Styled text
├── Button.tsx            - Hand-drawn buttons
├── LinedInput.tsx        - Lined paper input
└── index.ts              - Exports
```

## 🗺️ Navigation

Type-safe navigation using React Navigation:
- Stack navigation with smooth transitions
- Modal-style for Lobby and Results
- Gesture-disabled during gameplay

## 🎯 Next Steps

- [ ] Integrate Socket.io client
- [ ] Complete all screens (Lobby, Results, Create/Join)
- [ ] Add state management (Redux Toolkit)
- [ ] Implement real-time game sync
- [ ] Add more animations (confetti, celebrations)
- [ ] Add sound effects (optional)
- [ ] Add haptic feedback

## 🎨 Design Inspiration

The design is inspired by:
- Vintage index cards and notebooks
- Hand-drawn illustrations
- Warm, nostalgic analog games
- Classic road trip game aesthetics

---

**Status**: Foundation complete, ready for Socket.io integration
