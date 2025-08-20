# Interactive Video Application

A modern, clean interactive video application built with React and TypeScript. This application allows users to create interactive video experiences with various elements like text, buttons, questions, and more.

## Features

- 🎥 **Video Player**: HTML5 video player with interactive overlay
- 🔧 **Admin Panel**: Add and manage interactive elements
- 👁️ **Preview Mode**: View the final interactive video experience
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💾 **Local Storage**: Persistent data storage
- 🎯 **Multiple Element Types**: Text, pointers, images, buttons, and questions

## Project Structure

```
src/
├── components/           # React components
│   ├── AdminPanel.tsx   # Main admin interface
│   ├── VideoPlayerAdmin.tsx    # Video player for admin mode
│   ├── VideoPlayerPreview.tsx  # Video player for preview mode
│   └── PreviewPage.tsx  # Preview page component
├── types/               # TypeScript type definitions
│   └── index.ts         # All application types
├── constants/           # Application constants
│   └── index.ts         # Configuration and constants
├── utils/               # Utility functions
│   └── index.ts         # Storage, validation, and helper functions
└── styles/              # CSS styles
    ├── AdminPanel.css   # Admin panel styles
    └── PreviewPage.css  # Preview page styles
```

## Element Types

The application supports several types of interactive elements:

- **Text**: Display text overlays on the video
- **Pointer**: Clickable pointer indicators
- **Image**: Display images with optional links
- **Opener**: Action buttons that trigger alerts or actions
- **Interactive Button**: Clickable buttons with custom actions
- **Interactive Question**: Multiple choice, true/false, or text input questions

## Routes

- `/` - Redirects to admin panel
- `/admin` - Admin panel for creating and managing interactive elements
- `/preview` - Preview mode to test the interactive video experience

## Key Technologies

- **React 19** with TypeScript
- **React Router** for navigation
- **HTML5 Video** for video playback
- **Local Storage** for data persistence
- **CSS3** with modern styling

## Development Standards

The codebase follows modern React and TypeScript best practices:

- ✅ **Type Safety**: Comprehensive TypeScript types
- ✅ **Modular Architecture**: Separated concerns with utilities, constants, and types
- ✅ **Clean Code**: Readable and maintainable code structure
- ✅ **Responsive Design**: Mobile-first CSS approach
- ✅ **Error Handling**: Proper error handling for storage and validation
- ✅ **Performance**: Optimized React components with proper refs and state management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the admin panel to start creating interactive videos.

## Configuration

The video URL and other configurations can be modified in `src/constants/index.ts`:

```typescript
export const VIDEO_CONFIG = {
  URL: 'https://files.vidstack.io/sprite-fight/720p.mp4',
  DEFAULT_ELEMENT_DURATION: 5, // seconds
} as const;
```

## Usage

1. **Admin Mode**: Use the admin panel to add interactive elements to your video
2. **Preview Mode**: Click the "Preview" button to test your interactive video
3. **Element Management**: Use the sidebar to add different types of interactive elements
4. **Save/Load**: Projects are automatically saved to local storage

This application provides a solid foundation for creating engaging interactive video experiences with a clean, maintainable codebase.
