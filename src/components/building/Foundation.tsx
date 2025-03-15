import React from 'react';
import * as THREE from 'three';

interface FoundationProps {
  length: number;
  width: number;
  concreteMaterial: THREE.Material;
}

const Foundation: React.FC<FoundationProps> = ({ 
  length, 
  width, 
  concreteMaterial 
}) => {
  // Expanded slab dimensions (600% larger)
  const slabLength = length * 6;
  const slabWidth = width * 6;
  
  // Create ground grass plane
  const createGrassPlane = () => {
    const groundLength = slabLength * 2;
    const groundWidth = slabWidth * 2;
    
    return (
      <mesh 
        position={[0, -0.24, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[groundLength, groundWidth]} />
        <meshStandardMaterial 
          color="#3B6E33"
          roughness={0.9}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
    );
  };

  // Create vegetation instances
  const createVegetation = () => {
    const vegetation = [];
    const vegetationCount = 600; // Doubled vegetation density for larger area
    
    // Define vegetation types with their properties
    const vegetationTypes = [
      {
        geometry: new THREE.ConeGeometry(0.8, 1.8, 8),
        material: new THREE.MeshStandardMaterial({ 
          color: '#2D5A27',
          roughness: 0.8,
          metalness: 0.1
        }), // Dark green
        maxScale: 1.5,
        minScale: 0.8,
        yOffset: 0.6
      },
      {
        geometry: new THREE.SphereGeometry(0.6, 10, 10),
        material: new THREE.MeshStandardMaterial({ 
          color: '#4A7A3D',
          roughness: 0.9,
          metalness: 0.1
        }), // Medium green
        maxScale: 1.3,
        minScale: 0.6,
        yOffset: 0.4
      },
      {
        geometry: new THREE.ConeGeometry(0.5, 1.2, 7),
        material: new THREE.MeshStandardMaterial({ 
          color: '#1E4422',
          roughness: 0.85,
          metalness: 0.1
        }), // Forest green
        maxScale: 1.2,
        minScale: 0.7,
        yOffset: 0.4
      },
      {
        geometry: new THREE.SphereGeometry(0.3, 8, 8),
        material: new THREE.MeshStandardMaterial({ 
          color: '#3B6E33',
          roughness: 0.9,
          metalness: 0.1
        }), // Olive green
        maxScale: 1.1,
        minScale: 0.5,
        yOffset: 0.3
      }
    ];
    
    // Calculate the area where vegetation can grow (outside concrete slab)
    const groundLength = slabLength * 2;
    const groundWidth = slabWidth * 2;
    const bufferZone = 2; // Buffer zone around slab
    
    for (let i = 0; i < vegetationCount; i++) {
      // Randomly select vegetation type
      const type = vegetationTypes[Math.floor(Math.random() * vegetationTypes.length)];
      
      // Generate random position
      let x, z;
      do {
        x = (Math.random() - 0.5) * groundLength;
        z = (Math.random() - 0.5) * groundWidth;
      } while (
        Math.abs(x) < slabLength / 2 + bufferZone && // Add buffer around slab
        Math.abs(z) < slabWidth / 2 + bufferZone
      );
      
      // Random scale and rotation
      const scale = type.minScale + Math.random() * (type.maxScale - type.minScale);
      const rotation = Math.random() * Math.PI * 2;
      
      // Add slight random offset to Y position for more natural look
      const yOffset = type.yOffset + (Math.random() * 0.2 - 0.1);
      
      vegetation.push(
        <mesh
          key={`vegetation-${i}`}
          geometry={type.geometry}
          material={type.material}
          position={[x, yOffset * scale, z]}
          scale={[scale, scale, scale]}
          rotation={[0, rotation, 0]}
          castShadow
          receiveShadow
        />
      );
    }
    
    return vegetation;
  };
  
  return (
    <>
      {/* 20cm thick concrete slab */}
      <mesh key="concrete-slab" position={[0, -0.1, 0]} material={concreteMaterial}>
        <boxGeometry args={[slabLength, 0.2, slabWidth]} />
      </mesh>
      
      {/* Ground (concrete) */}
      <mesh key="ground" position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[slabLength * 2, slabWidth * 2]} />
        <meshStandardMaterial color="#2D5A27" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Interior floor (concrete) */}
      <mesh key="interior-floor" position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial 
          color="#d0d0d0" 
          roughness={0.8} 
          metalness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Slab edge chamfer */}
      <mesh key="slab-edge" position={[0, -0.2, 0]} material={concreteMaterial}>
        <boxGeometry args={[slabLength + 0.1, 0.05, slabWidth + 0.1]} />
      </mesh>
      
      {/* Ground vegetation */}
      {createVegetation()}
      {createGrassPlane()}
    </>
  );
};

export default Foundation;