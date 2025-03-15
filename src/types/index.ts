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
  DomeSkylights = 'domeSkylights',
  RidgeSkylights = 'ridgeSkylights',
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
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth?: number; length?: number };
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