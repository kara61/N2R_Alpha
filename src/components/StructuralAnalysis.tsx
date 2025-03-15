import React, { useEffect, useState } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { recommendProfile } from '../data/structuralProfiles';
import { StructuralProfile } from '../types';
import { AlertTriangle, Check } from 'lucide-react';

const StructuralAnalysis: React.FC = () => {
  const { dimensions, snowLoad, setSelectedProfile } = useBuildingStore();
  const [recommendedProfile, setRecommendedProfile] = useState<StructuralProfile | null>(null);
  const [isValid, setIsValid] = useState(true);
  
  useEffect(() => {
    // Calculate required span based on building width
    const requiredSpan = dimensions.width;
    
    // Get recommended profile
    const profile = recommendProfile(requiredSpan, snowLoad);
    
    setRecommendedProfile(profile);
    setSelectedProfile(profile);
    setIsValid(!!profile);
  }, [dimensions.width, snowLoad, setSelectedProfile]);
  
  if (!recommendedProfile) {
    return (
      <div className="bg-accent-red bg-opacity-20 p-3 rounded-md mt-2 neumorphic-inset animate-fadeIn">
        <div className="flex items-center text-accent-red mb-1">
          <AlertTriangle className="h-5 w-5 mr-1" />
          <span className="font-semibold">Structural Warning</span>
        </div>
        <p className="text-sm text-light-gray">
          No suitable profile found for the current span ({dimensions.width}m) and snow load ({snowLoad} kN/m²).
          Consider reducing the building width or using a custom structural solution.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-accent-green bg-opacity-20 p-3 rounded-md mt-2 neumorphic-inset animate-fadeIn">
      <div className="flex items-center text-accent-green mb-1">
        <Check className="h-5 w-5 mr-1" />
        <span className="font-semibold">Structural Analysis</span>
      </div>
      
      <div className="text-sm space-y-1 text-light-gray">
        <p>Recommended profile: <strong className="text-white">{recommendedProfile.name}</strong></p>
        <p>Material: <span className="font-mono">{recommendedProfile.material}</span></p>
        <p>Type: {recommendedProfile.type}</p>
        <p>Max span: <span className="font-mono">{recommendedProfile.allowableSpan}m</span></p>
        <p>Snow load capacity: <span className="font-mono">{recommendedProfile.snowLoadCapacity} kN/m²</span></p>
      </div>
    </div>
  );
};

export default StructuralAnalysis;