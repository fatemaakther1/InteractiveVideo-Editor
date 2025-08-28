# Animation Preview Feature

## Overview
The animation preview feature allows users to instantly see how their animations will look without needing to press "Preview" or play the full video. This provides immediate visual feedback when working with effects and animations.

## Features

### 1. Auto-Preview
- Automatically triggers animation preview when animation settings are changed
- Works for entrance animations, exit animations, and interactive effects
- Provides instant feedback without user intervention

### 2. Manual Preview Buttons
- **Entrance Animation Preview**: Blue "Preview" button next to entrance animation settings
- **Exit Animation Preview**: Red "Preview" button next to exit animation settings  
- **Interactive Effects Preview**: Yellow "Preview" button in the interactive effects section

### 3. Supported Animations

#### Entrance Animations
- Fade In
- Slide In Left
- Slide In Right
- Scale In
- Bounce In

#### Exit Animations  
- Fade Out
- Slide Out Left
- Slide Out Right
- Scale Out

#### Interactive Effects
- Pulse When Visible (continuous pulsing effect)
- Scale On Hover (element grows on hover)
- Bounce On Click (element bounces when clicked)

## How It Works

### 1. Element Identification
Elements are identified using `data-element-id` attributes added to the DOM elements in the `ResizableDraggableElement` component.

### 2. Animation Triggering
The `triggerAnimationPreview()` function:
- Finds the element by its ID
- Removes any existing animation classes
- Applies the selected animation class
- Sets custom CSS properties for duration, delay, and easing
- Automatically cleans up after the animation completes

### 3. Interactive Effects Preview
The `triggerInteractiveEffectsPreview()` function:
- Applies enabled interactive effect classes
- For bounce effects, triggers the animation immediately
- Auto-removes pulse effects after 4 seconds for preview purposes

### 4. Auto-Cleanup
- Animation classes are automatically removed after completion
- CSS custom properties are reset
- Fallback timeout ensures cleanup even if `animationend` event doesn't fire

## Usage

### For Users
1. Select an element on the video canvas
2. Go to the "Effects" tab in the Inspector Panel
3. Choose an animation type from the dropdowns - it will auto-preview
4. Use the "Preview" buttons to replay animations manually
5. Adjust duration, delay, and easing settings to see changes instantly

### For Developers
The animation preview system consists of:

- `animationUtils.ts`: Core preview functions
- `InspectorPanel.tsx`: UI integration with preview buttons
- `ResizableDraggableElement.tsx`: DOM element identification
- `index.css`: Animation styles and preview-specific CSS

## Technical Implementation

### Key Functions
- `triggerAnimationPreview(elementId, type, element)`: Triggers entrance/exit animations
- `triggerInteractiveEffectsPreview(elementId, effects)`: Triggers interactive effects
- `resetElementAnimation(elementId)`: Resets element to default state

### CSS Classes
- `.animation-preview`: Applied during preview for higher z-index
- Animation classes follow the pattern: `.animate-{animationType}`
- Effect classes follow the pattern: `.effect-{effectType}`

### Auto-Preview Timing
- 100ms delay after settings change to allow DOM updates
- Automatic cleanup after animation duration + delay + 100ms buffer

## Benefits

1. **Instant Feedback**: See animations immediately without playing the video
2. **Efficient Workflow**: No need to constantly switch to preview mode
3. **Fine-Tuning**: Easy to adjust timing and easing with real-time feedback
4. **Visual Confirmation**: Verify animations work as expected before finalizing

## Browser Compatibility
- Uses standard CSS animations and DOM APIs
- Compatible with all modern browsers
- Gracefully degrades if `animationend` events are not supported (fallback timeout)
