import React from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { ElementType, WallType } from '../types';

const DoorPositionTest: React.FC = () => {
  const { elements, addElement } = useBuildingStore();
  
  // Function to add test doors
  const addTestDoors = () => {
    // Clear existing elements
    useBuildingStore.setState({ elements: [] });
    
    // Add a regular door
    addElement({
      id: `test-door-${Date.now()}`,
      type: ElementType.Door,
      position: { x: -3, y: 1.05, z: 0 }, // y = height/2 = 2.1/2
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 1.0, height: 2.1, depth: 0.1 },
      material: {
        id: 'door',
        name: 'Door',
        color: '#FF0000', // Red
        roughness: 0.7,
        metalness: 0.3,
      },
      wall: WallType.North
    });
    
    // Add a sectional door
    addElement({
      id: `test-sectional-${Date.now()}`,
      type: ElementType.SectionalDoor,
      position: { x: 0, y: 1.5, z: 0 }, // y = height/2 = 3.0/2
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 3.0, height: 3.0, depth: 0.2 },
      material: {
        id: 'sectional',
        name: 'Sectional Door',
        color: '#00FF00', // Green
        roughness: 0.6,
        metalness: 0.4,
      },
      wall: WallType.North
    });
    
    // Add a windowed sectional door
    addElement({
      id: `test-windowed-${Date.now()}`,
      type: ElementType.WindowedSectionalDoor,
      position: { x: 3, y: 1.5, z: 0 }, // y = height/2 = 3.0/2
      rotation: { x: 0, y: 0, z: 0 },
      dimensions: { width: 3.0, height: 3.0, depth: 0.2 },
      material: {
        id: 'windowed',
        name: 'Windowed Sectional Door',
        color: '#0000FF', // Blue
        roughness: 0.6,
        metalness: 0.4,
      },
      wall: WallType.North
    });
    
    console.log("Added test doors with bottom edges at y=0");
  };
  
  return (
    <button 
      onClick={addTestDoors}
      className="fixed bottom-20 right-4 bg-red-600 text-white p-2 rounded-md"
    >
      Test Door Positioning
    </button>
  );
};

export default DoorPositionTest;
