import React, { useRef, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { useBuildingStore } from '../store/buildingStore';
import Building from './Building';
import { Vector3, Object3D } from 'three';
import { RoofElementType } from '../types'; 
import { Camera } from 'lucide-react';

const ScreenshotControls = () => {
  const { gl, camera, scene } = useThree();
  const { dimensions } = useBuildingStore();
  const originalPosition = useRef<Vector3>();
  
  const takeScreenshots = useCallback(() => {
    // Store original camera position
    originalPosition.current = camera.position.clone();
    
    // Set higher resolution for screenshots
    const originalSize = {
      width: gl.domElement.width,
      height: gl.domElement.height
    };
    
    // Increase resolution (2x)
    gl.setSize(originalSize.width * 2, originalSize.height * 2);
    
    // Calculate camera positions based on building size
    const maxDimension = Math.max(dimensions.length, dimensions.width, dimensions.height);
    const distance = maxDimension * 0.7; // Zoom in slightly
    const height = maxDimension * 0.5; // Adjust height for better perspective
    
    // Define the four corner positions
    const positions = [
      { x: distance, y: height, z: distance }, // Front-right
      { x: -distance, y: height, z: distance }, // Front-left
      { x: -distance, y: height, z: -distance }, // Back-left
      { x: distance, y: height, z: -distance }, // Back-right
    ];
    
    // Take screenshots from each position
    positions.forEach((pos, index) => {
      // Move camera to position
      camera.position.set(pos.x, pos.y, pos.z);
      camera.lookAt(0, 0, 0);
      
      // Update camera matrix
      camera.updateMatrixWorld();
      
      // Render the scene
      gl.render(scene, camera);
      
      // Create a link element for downloading
      const link = document.createElement('a');
      link.download = `building-view-${index + 1}.png`;
      link.href = gl.domElement.toDataURL('image/png', 1.0);
      
      // Trigger file save dialog
      link.click();
    });
    
    // Restore original resolution
    gl.setSize(originalSize.width, originalSize.height);
    
    // Restore original camera position
    camera.position.copy(originalPosition.current!);
    camera.lookAt(0, 0, 0);
  }, [gl, scene, camera, dimensions]);
  
  // Expose takeScreenshots to window for external access
  React.useEffect(() => {
    (window as any).takeScreenshots = takeScreenshots;
  }, [takeScreenshots]);
  
  return null;
};

const CameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const { dimensions } = useBuildingStore();
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    // Position camera based on building size
    const maxDimension = Math.max(dimensions.length, dimensions.width, dimensions.height);
    const distance = maxDimension * 0.9;
    
    camera.position.set(distance, distance * 0.7, distance);
    camera.lookAt(new Vector3(0, 0, 0));
  }, [camera, dimensions]);

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} target={[0, 0, 0]} />;
};

const Scene: React.FC = () => {
  const { 
    dimensions, 
    roofElements, 
    selectedRoofElementId, 
    updateRoofElement,
    selectRoofElement
  } = useBuildingStore();
  
  
  // Handle click on scene to detect roof elements
  const handleSceneClick = (event) => {
    // If we clicked on a roof element, select it
    if (event.object && event.object.userData && event.object.userData.isRoofElement) {
      selectRoofElement(event.object.userData.id);
    }
  };
  
  // Enhanced lighting setup
  const sunPosition = [50, 50, -50];
  
  return (
    <>
      {/* Soft ambient light for overall illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Main sunlight with shadows */}
      <directionalLight 
        position={sunPosition}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Fill light for softer shadows */}
      <directionalLight 
        position={[-30, 20, 30]} 
        intensity={0.3} 
      />
      
      <CameraController />
      
      {/* Sunny sky */}
      <Sky 
        distance={450000}
        sunPosition={sunPosition}
        inclination={0.3}
        azimuth={0.25}
        mieCoefficient={0.001}
        mieDirectionalG={0.7}
        rayleigh={0.2}
        turbidity={10}
      />
      
      <Building />
      <Environment preset="sunset" background={false} />
      <ScreenshotControls />
    </>
  );
};

const Viewport3D: React.FC = () => {
  const { showFacadeEditor } = useBuildingStore();
  
  return (
    <div className="flex-1 h-screen relative">
      <Canvas shadows>
        <Scene />
      </Canvas>
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => (window as any).takeScreenshots?.()}
          className="bg-steel-blue hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200"
        >
          <Camera className="h-5 w-5 mr-2" />
          <span>Take Screenshots</span>
        </button>
      </div>
    </div>
  );
};

export default Viewport3D;