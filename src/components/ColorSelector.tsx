import React from 'react';
import { RalColor } from '../types';
import { Palette } from 'lucide-react';

interface ColorSelectorProps {
  colors: RalColor[];
  selectedColorId: string;
  onColorSelect: (colorId: string) => void;
  title: string;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  colors, 
  selectedColorId, 
  onColorSelect,
  title
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium flex items-center mb-2 text-accent-yellow">
        <Palette className="h-4 w-4 mr-1" /> {title}
      </h3>
      
      <div className="grid grid-cols-5 gap-2">
        {colors.map(color => (
          <button
            key={color.id}
            onClick={() => onColorSelect(color.id)}
            className={`relative p-1 rounded-md transition-all ${
              selectedColorId === color.id 
                ? 'ring-2 ring-accent-yellow scale-110 z-10' 
                : 'hover:scale-105'
            }`}
            title={`${color.code} - ${color.name}${color.description ? `: ${color.description}` : ''}`}
          >
            <div 
              className="w-full h-10 rounded-sm shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <span className="block text-xs mt-1 text-center text-light-gray truncate">
              {color.code}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;