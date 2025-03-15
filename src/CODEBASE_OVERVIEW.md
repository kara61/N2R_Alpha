# Industrial Hall Generator - Codebase Overview

## Core Structure

### Main Entry Points
- **main.tsx**: Entry point of the application, renders the App component
- **App.tsx**: Main component that integrates all parts of the application
- **index.html**: Base HTML document
- **index.css**: Global styles

### Configuration
- **tailwind.config.js**: Tailwind CSS configuration with custom colors, fonts, and shadows
- **eslint.config.js**: ESLint configuration for the project

## State Management

- **store/buildingStore.ts**: Central store using Zustand that manages all application state:
  - Building dimensions
  - Materials and cladding types
  - Elements (windows, doors, etc.)
  - Snow load and structural analysis
  - UI state (selected elements, editors visibility)
  - Color selections

## Components

### UI Core
- **components/Sidebar.tsx**: Main control panel with all configuration options
- **components/Viewport3D.tsx**: 3D visualization of the building

### Editors
- **components/FacadeEditor.tsx**: Interface for adding/editing facade elements
- **components/RoofEditor.tsx**: Interface for adding/editing roof elements
- **components/ElementControls.tsx**: Controls for selected facade elements
- **components/RoofElementControls.tsx**: Controls for selected roof elements

### Analysis
- **components/StructuralAnalysis.tsx**: Shows structural analysis results based on building dimensions and snow load

### UI Elements
- **components/ColorSelector.tsx**: Color picker for facade and roof
- **components/RoofElementsPanel.tsx**: Controls for roof-specific elements

## Data & Types

- **types.ts**: TypeScript interfaces and enums for the application
- **data/structuralProfiles.ts**: Contains data for structural profiles and recommendation logic
- **data/ralColors.ts**: RAL color definitions for facades and roofs

## Feature Flow

1. **Building Configuration**:
   - User sets dimensions in Sidebar
   - Updates are stored in buildingStore
   - 3D model is updated in Viewport3D

2. **Element Management**:
   - User opens FacadeEditor or RoofEditor from Sidebar
   - Elements can be added/positioned in the editors
   - Selected elements can be modified via ElementControls

3. **Structural Analysis**:
   - User sets snow load in Sidebar
   - StructuralAnalysis component calculates and recommends profiles
   - Results displayed in the Sidebar

4. **Color Management**:
   - User selects colors from ColorSelector components
   - Selected colors are applied to the 3D model

## Working With This Codebase

When making modifications:

1. **UI Changes**: Usually involve Sidebar.tsx or specific editor components
2. **Logic Changes**: Often in buildingStore.ts or data files
3. **Visual Changes**: May require updates to Viewport3D.tsx or CSS/Tailwind config
4. **New Features**: Might need changes across multiple files

When requesting a specific modification, include these files in the working set:
- The main file being modified
- Any directly related files (those importing/exported by the main file)
- Store files if state changes are involved
