import { RalColor } from '../types';

// Common RAL colors for industrial buildings
export const ralColors: RalColor[] = [
  // Facade colors
  {
    id: 'ral9002',
    name: 'Grey White',
    code: 'RAL 9002',
    hex: '#E7EBDA',
    category: 'both',
    description: 'Most common for industrial walls & sandwich panels'
  },
  {
    id: 'ral9006',
    name: 'White Aluminum',
    code: 'RAL 9006',
    hex: '#A5A5A5',
    category: 'both',
    description: 'Metallic finish, used for modern facades'
  },
  {
    id: 'ral9007',
    name: 'Grey Aluminum',
    code: 'RAL 9007',
    hex: '#8F8F8F',
    category: 'both',
    description: 'Darker metallic tone, corporate buildings'
  },
  {
    id: 'ral7016',
    name: 'Anthracite Grey',
    code: 'RAL 7016',
    hex: '#293133',
    category: 'both',
    description: 'Popular for modern & high-end industrial buildings'
  },
  {
    id: 'ral7035',
    name: 'Light Grey',
    code: 'RAL 7035',
    hex: '#D7D7D7',
    category: 'both',
    description: 'Standard for industrial and commercial buildings'
  }
];

// Get colors by category
export const getFacadeColors = () => ralColors.filter(color => 
  color.category === 'facade' || color.category === 'both'
);

export const getRoofColors = () => ralColors.filter(color => 
  color.category === 'roof' || color.category === 'both'
);

// Get color by ID
export const getColorById = (id: string) => 
  ralColors.find(color => color.id === id);

// Added function to get hex color value by ID
export const getRalColorByHex = (id: string): string | undefined => {
  const color = ralColors.find(color => color.id === id);
  return color?.hex;
};