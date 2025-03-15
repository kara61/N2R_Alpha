import { create } from 'zustand';
import { 
  HallDimensions, 
  RoofType, 
  CladdingType, 
  BuildingElement, 
  Layer, 
  StructuralProfile,
  BuildingStats,
  ElementType,
  WallType,
  RoofElement
  // Removed RoofElementType since it's unused
} from '../types';

interface BuildingState {
  dimensions: HallDimensions;
  claddingType: CladdingType;
  elements: BuildingElement[];
  roofElements: RoofElement[];
  layers: Layer[];
  selectedProfile: StructuralProfile | null;
  snowLoad: number;
  selectedElementId: string | null;
  selectedRoofElementId: string | null;
  selectedWall: WallType;
  showFacadeEditor: boolean;
  showRoofEditor: boolean;
  stats: BuildingStats;
  facadeColorId: string;
  roofColorId: string;
  
  // Actions
  setDimensions: (dimensions: Partial<HallDimensions>) => void;
  setCladdingType: (type: CladdingType) => void;
  addElement: (element: BuildingElement) => void;
  updateElement: (id: string, updates: Partial<BuildingElement>) => void;
  removeElement: (id: string) => void;
  addRoofElement: (element: RoofElement) => void;
  updateRoofElement: (id: string, updates: Partial<RoofElement>) => void;
  removeRoofElement: (id: string) => void;
  toggleLayer: (id: string) => void;
  setSelectedProfile: (profile: StructuralProfile | null) => void;
  setSnowLoad: (load: number) => void;
  selectElement: (id: string | null) => void;
  selectRoofElement: (id: string | null) => void;
  setSelectedWall: (wall: WallType) => void;
  toggleFacadeEditor: (show: boolean) => void;
  toggleRoofEditor: (show: boolean) => void;
  calculateStats: () => void;
  setFacadeColor: (colorId: string) => void;
  setRoofColor: (colorId: string) => void;
}

// Default materials
// const defaultMaterials = {
//   glass: {
//     id: 'glass',
//     name: 'Glass',
//     color: '#a3c6e8',
//     roughness: 0.1,
//     metalness: 0.9,
//   },
//   metal: {
//     id: 'metal',
//     name: 'Metal',
//     color: '#b0b0b0',
//     roughness: 0.5,
//     metalness: 0.8,
//   },
//   door: {
//     id: 'door',
//     name: 'Door',
//     color: '#4a4a4a',
//     roughness: 0.7,
//     metalness: 0.3,
//   },
//   lightBand: {
//     id: 'lightBand',
//     name: 'Light Band',
//     color: '#e0e0e0',
//     roughness: 0.2,
//     metalness: 0.1,
//   },
//   polycarbonate: {
//     id: 'polycarbonate',
//     name: 'Polycarbonate',
//     color: '#d4f1f9',
//     roughness: 0.2,
//     metalness: 0.1,
//   }
// };

export const useBuildingStore = create<BuildingState>((set, get) => ({
  dimensions: {
    length: 20,
    width: 15,
    height: 6,
    roofType: RoofType.Gable,
    roofPitch: 20, // Default 20% pitch
  },
  claddingType: CladdingType.SandwichPanel80,
  elements: [],
  roofElements: [],
  layers: [
    { id: 'structure', name: 'Structure', visible: true },
    { id: 'cladding', name: 'Cladding', visible: true },
    { id: 'elements', name: 'Windows & Doors', visible: true },
    { id: 'roofElements', name: 'Roof Elements', visible: true },
  ],
  selectedProfile: null,
  snowLoad: 1.5, // kN/m²
  selectedElementId: null,
  selectedRoofElementId: null,
  selectedWall: WallType.North,
  showFacadeEditor: false,
  showRoofEditor: false,
  facadeColorId: 'ral9002', // Default Grey White
  roofColorId: 'ral7016', // Default Anthracite Grey
  stats: {
    roofArea: 0,
    wallArea: 0,
    totalArea: 0,
    elements: {
      windows: 0,
      doors: 0,
      sectionalDoors: 0,
      lightBands: 0,
    },
  },

  setDimensions: (dimensions) => 
    set((state) => {
      const newDimensions = { ...state.dimensions, ...dimensions };
      return { dimensions: newDimensions };
    }),

  setCladdingType: (type) => set({ claddingType: type }),

  addElement: (element) => 
    set((state) => ({ 
      elements: [...state.elements, element],
      selectedElementId: element.id // Auto-select the newly added element
    })),

  updateElement: (id, updates) => 
    set((state) => ({
      elements: state.elements.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    })),

  removeElement: (id) => 
    set((state) => ({
      elements: state.elements.filter(element => element.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
    })),

  addRoofElement: (element) => 
    set((state) => ({ 
      roofElements: [...state.roofElements, element],
      selectedRoofElementId: element.id // Auto-select the newly added element
    })),

  updateRoofElement: (id, updates) => 
    set((state) => ({
      roofElements: state.roofElements.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    })),

  removeRoofElement: (id) => 
    set((state) => ({
      roofElements: state.roofElements.filter(element => element.id !== id),
      selectedRoofElementId: state.selectedRoofElementId === id ? null : state.selectedRoofElementId
    })),

  toggleLayer: (id) => 
    set((state) => ({
      layers: state.layers.map(layer => 
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    })),

  setSelectedProfile: (profile) => set({ selectedProfile: profile }),

  setSnowLoad: (load) => set({ snowLoad: load }),

  selectElement: (id) => set({ selectedElementId: id, selectedRoofElementId: null }),
  
  selectRoofElement: (id) => set({ selectedRoofElementId: id, selectedElementId: null }),
  
  setSelectedWall: (wall) => set({ selectedWall: wall }),
  
  toggleFacadeEditor: (show) => set({ showFacadeEditor: show, showRoofEditor: false }),
  
  toggleRoofEditor: (show) => set({ showRoofEditor: show, showFacadeEditor: false }),
  
  setFacadeColor: (colorId) => set({ facadeColorId: colorId }),
  
  setRoofColor: (colorId) => set({ roofColorId: colorId }),

  calculateStats: () => {
    const { dimensions, elements } = get();
    
    // Calculate roof area based on roof type
    let roofArea = 0;
    if (dimensions.roofType === RoofType.Flat) {
      roofArea = dimensions.length * dimensions.width;
    } else if (dimensions.roofType === RoofType.Gable) {
      // More accurate calculation for gable roof
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100); // Using roof pitch percentage
      const roofWidth = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2)) * 2;
      roofArea = dimensions.length * roofWidth;
    } else if (dimensions.roofType === RoofType.Monopitch) {
      // More accurate calculation for monopitch
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100); // Using roof pitch percentage
      const roofLength = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
      roofArea = dimensions.length * roofLength;
    }

    // Calculate wall area
    const perimeterLength = 2 * (dimensions.length + dimensions.width);
    const wallArea = perimeterLength * dimensions.height;

    // Count elements
    const elementCounts = {
      windows: elements.filter(e => e.type === ElementType.Window).length,
      doors: elements.filter(e => e.type === ElementType.Door).length,
      sectionalDoors: elements.filter(e => e.type === ElementType.SectionalDoor).length,
      lightBands: elements.filter(e => e.type === ElementType.LightBand).length,
    };

    set({
      stats: {
        roofArea: Math.round(roofArea * 100) / 100,
        wallArea: Math.round(wallArea * 100) / 100,
        totalArea: Math.round((roofArea + wallArea ) * 100) / 100,
        elements: elementCounts
      }
    });
  }
}));