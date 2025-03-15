import { StructuralProfile } from '../types';

// Eurocode steel profiles
export const structuralProfiles: StructuralProfile[] = [
  {
    id: 'ipe200',
    name: 'IPE 200',
    type: 'I-beam',
    dimensions: {
      height: 200,
      width: 100,
      webThickness: 5.6,
      flangeThickness: 8.5,
    },
    material: 'S235',
    allowableSpan: 6,
    snowLoadCapacity: 2.5,
  },
  {
    id: 'ipe240',
    name: 'IPE 240',
    type: 'I-beam',
    dimensions: {
      height: 240,
      width: 120,
      webThickness: 6.2,
      flangeThickness: 9.8,
    },
    material: 'S235',
    allowableSpan: 7.5,
    snowLoadCapacity: 3.0,
  },
  {
    id: 'ipe300',
    name: 'IPE 300',
    type: 'I-beam',
    dimensions: {
      height: 300,
      width: 150,
      webThickness: 7.1,
      flangeThickness: 10.7,
    },
    material: 'S235',
    allowableSpan: 9,
    snowLoadCapacity: 3.5,
  },
  {
    id: 'ipe360',
    name: 'IPE 360',
    type: 'I-beam',
    dimensions: {
      height: 360,
      width: 170,
      webThickness: 8.0,
      flangeThickness: 12.7,
    },
    material: 'S235',
    allowableSpan: 12,
    snowLoadCapacity: 4.0,
  },
  {
    id: 'hea200',
    name: 'HEA 200',
    type: 'H-beam',
    dimensions: {
      height: 190,
      width: 200,
      webThickness: 6.5,
      flangeThickness: 10.0,
    },
    material: 'S235',
    allowableSpan: 8,
    snowLoadCapacity: 3.2,
  },
  {
    id: 'hea300',
    name: 'HEA 300',
    type: 'H-beam',
    dimensions: {
      height: 290,
      width: 300,
      webThickness: 8.5,
      flangeThickness: 14.0,
    },
    material: 'S235',
    allowableSpan: 12,
    snowLoadCapacity: 4.5,
  },
  {
    id: 'chs168',
    name: 'CHS 168.3x5',
    type: 'Circular Hollow Section',
    dimensions: {
      height: 168.3,
      width: 168.3,
      webThickness: 5.0,
      flangeThickness: 5.0,
    },
    material: 'S235',
    allowableSpan: 7,
    snowLoadCapacity: 2.8,
  },
  {
    id: 'rhs200x100',
    name: 'RHS 200x100x5',
    type: 'Rectangular Hollow Section',
    dimensions: {
      height: 200,
      width: 100,
      webThickness: 5.0,
      flangeThickness: 5.0,
    },
    material: 'S235',
    allowableSpan: 8,
    snowLoadCapacity: 3.0,
  },
];

// Function to recommend a profile based on span and snow load
export const recommendProfile = (span: number, snowLoad: number): StructuralProfile | null => {
  // Filter profiles that can handle the span and snow load
  const suitableProfiles = structuralProfiles.filter(
    profile => profile.allowableSpan >= span && profile.snowLoadCapacity >= snowLoad
  );
  
  // Sort by size (smaller first) to get the most economical option
  suitableProfiles.sort((a, b) => a.dimensions.height - b.dimensions.height);
  
  return suitableProfiles.length > 0 ? suitableProfiles[0] : null;
};