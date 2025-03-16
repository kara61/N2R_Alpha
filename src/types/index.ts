export interface HallDimensions {
  length: number;
  width: number;
  height: number;
  roofType: RoofType;
  roofPitch: number; // Added roof pitch as a percentage
}

export enum RoofType {
  Flat = 'flat',
  Gable = 'gable',
  Monopitch = 'monopitch',
}

export enum CladdingType {
  TrapezoidSheet = 'trapezoid',
  SandwichPanel60 = 'sandwich60',
  SandwichPanel80 = 'sandwich80',
  SandwichPanel100 = 'sandwich100',
}

export enum WallType {
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West',
}

export enum RoofElementType {
  RoofWindow = 'roofWindow', // Changed from DomeSkylights to RoofWindow
  RidgeSkylights = 'ridgeSkylights',
  // We could add more roof element types in the future:
  // VentilationUnit = 'ventilationUnit',
  // SolarPanel = 'solarPanel',
}

export interface Material {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  textureUrl?: string;
}

export interface BuildingElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth?: number };
  material: Material;
  wall?: WallType;
}

export interface RoofElement {
  id: string;
  type: RoofElementType;
  position: { 
    x: number; // Position along building length
    y: number; // Height above ground level
    z: number; // Position along building width
  };
  rotation: { 
    x: number; // Pitch (to match roof slope)
    y: number; // Yaw (to orient along ridge or roof surface)
    z: number; // Roll (rarely used)
  };
  dimensions: { 
    width: number;   // For dome: diameter; for ridge: width perpendicular to ridge
    height: number;  // Height of the element above roof surface
    depth?: number;  // Optional depth parameter
    length?: number; // Used for ridge skylights: length along ridge
  };
  material: Material;
}

export enum ElementType {
  Window = 'window',
  Door = 'door',
  SectionalDoor = 'sectionalDoor',
  WindowedSectionalDoor = 'windowedSectionalDoor',
  LightBand = 'lightBand',
}

export interface StructuralProfile {
  id: string;
  name: string;
  type: string;
  dimensions: {
    height: number;
    width: number;
    webThickness: number;
    flangeThickness: number;
  };
  material: string;
  allowableSpan: number;
  snowLoadCapacity: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface BuildingStats {
  roofArea: number;
  wallArea: number;
  totalArea: number;
  elements: {
    windows: number;
    doors: number;
    sectionalDoors: number;
    lightBands: number;
  };
}

export interface RalColor {
  id: string;
  name: string;
  code: string;
  hex: string;
  category: 'facade' | 'roof' | 'both';
  description?: string;
}