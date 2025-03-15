import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { RoofElementType, RoofType } from '../types';
import { X, Move, ArrowLeft, Plus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const RoofEditor: React.FC = () => {
  const { 
    dimensions, 
    roofElements, 
    selectedRoofElementId, 
    updateRoofElement, 
    selectRoofElement,
    toggleRoofEditor,
    addRoofElement,
    removeRoofElement
  } = useBuildingStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { roofType, roofPitch } = dimensions;
  
  // Calculate canvas dimensions based on container size
  const calculateCanvasDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const containerHeight = containerRef.current.clientHeight - 40;
    
    // Get roof dimensions
    let roofWidth, roofLength;
    
    roofLength = dimensions.length;
    
    if (roofType === RoofType.Flat) {
      roofWidth = dimensions.width;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
      roofWidth = slopeLength * 2;
    } else { // Monopitch
      // For monopitch roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
    }
    
    // Calculate aspect ratio
    const roofRatio = roofLength / roofWidth;
    const containerRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerRatio > roofRatio) {
      // Container is wider than needed, height is the limiting factor
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * roofRatio;
    } else {
      // Container is taller than needed, width is the limiting factor
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / roofRatio;
    }
    
    return {
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasHeight)
    };
  }, [dimensions, roofType]);
  
  // Resize canvas when window or container size changes
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      
      const { width, height } = calculateCanvasDimensions();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      // Redraw canvas
      drawCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateCanvasDimensions]);
  
  // Draw the roof
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions based on roof type
    const roofLength = dimensions.length;
    let roofWidth;
    
    if (roofType === RoofType.Flat) {
      roofWidth = dimensions.width;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
      roofWidth = slopeLength * 2;
    } else { // Monopitch
      // For monopitch roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
    }
    
    // Scale factors
    const scaleX = canvas.width / roofLength;
    const scaleY = canvas.height / roofWidth;
    
    // Draw roof - industrial style with darker background
    ctx.fillStyle = '#2B3A42';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint grid
    ctx.strokeStyle = '#3A4A52';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines (every meter)
    for (let x = 0; x <= roofLength; x++) {
      const canvasX = x * scaleX;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines (every meter)
    for (let y = 0; y <= roofWidth; y++) {
      const canvasY = y * scaleY;
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(canvas.width, canvasY);
      ctx.stroke();
    }
    
    // Draw roof outline with stronger emphasis
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Draw roof ridge for gable roof
    if (roofType === RoofType.Gable) {
      ctx.strokeStyle = '#F5A623';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    
    // Draw roof elements
    roofElements.forEach(element => {
      // Convert 3D position to 2D roof position
      let x, y;
      
      // Map x position directly to canvas x
      x = (element.position.x + roofLength / 2) * scaleX;
      
      // Map z position to canvas y
      if (roofType === RoofType.Flat) {
        y = (element.position.z + roofWidth / 2) * scaleY;
      } else if (roofType === RoofType.Gable) {
        // For gable roof, need to map based on which side of the ridge
        if (element.position.z < 0) {
          // Front side of roof
          const distanceFromRidge = Math.abs(element.position.z);
          y = (canvas.height / 2) - (distanceFromRidge * scaleY);
        } else {
          // Back side of roof
          const distanceFromRidge = Math.abs(element.position.z);
          y = (canvas.height / 2) + (distanceFromRidge * scaleY);
        }
      } else { // Monopitch
        // For monopitch, map z directly but adjust for the slope
        y = (element.position.z + roofWidth / 2) * scaleY;
      }
      
      // Element dimensions
      const width = element.dimensions.width * scaleX;
      const height = element.type === RoofElementType.RidgeSkylights 
        ? (element.dimensions.length || 1) * scaleX 
        : element.dimensions.width * scaleY;
      
      // Set colors based on element type - industrial theme
      let fillColor, strokeColor;
      
      fillColor = element.id === selectedRoofElementId ? '#F5A623' : '#d4f1f9';
      strokeColor = element.id === selectedRoofElementId ? '#F7B84B' : '#0066cc';
      
      // Draw element with industrial style
      ctx.fillStyle = fillColor;
      
      if (element.type === RoofElementType.DomeSkylights) {
        // Draw as circle for dome skylights
        ctx.beginPath();
        ctx.arc(x, y, width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = element.id === selectedRoofElementId ? 3 : 2;
        ctx.beginPath();
        ctx.arc(x, y, width / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Draw as rectangle for ridge skylights
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Draw outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = element.id === selectedRoofElementId ? 3 : 2;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);
      }
      
      // Draw element type label with technical font
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(element.type === RoofElementType.DomeSkylights ? 'Dome' : 'Ridge', x, y);
    });
  }, [dimensions, roofElements, selectedRoofElementId, roofType]);
  
  // Update canvas when relevant state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, dimensions, roofElements, selectedRoofElementId]);
  
  // Handle mouse events for dragging elements
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over an element
    const clickedElement = findElementAtPosition(mouseX, mouseY);
    
    if (clickedElement) {
      selectRoofElement(clickedElement.id);
      setIsDragging(true);
    } else {
      selectRoofElement(null);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedRoofElementId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert canvas position to 3D position
    const roofLength = dimensions.length;
    let roofWidth;
    
    if (roofType === RoofType.Flat) {
      roofWidth = dimensions.width;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
      roofWidth = slopeLength * 2;
    } else { // Monopitch
      // For monopitch roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
    }
    
    const scaleX = canvas.width / roofLength;
    const scaleY = canvas.height / roofWidth;
    
    // Get the element to update
    const element = roofElements.find(el => el.id === selectedRoofElementId);
    if (!element) return;
    
    // Calculate new position based on roof type
    let newPosition = { ...element.position };
    
    // Map canvas x to 3D x position
    newPosition.x = (mouseX / scaleX) - (roofLength / 2);
    
    // Map canvas y to 3D z position based on roof type
    if (roofType === RoofType.Flat) {
      newPosition.z = (mouseY / scaleY) - (roofWidth / 2);
      newPosition.y = dimensions.height + 0.01;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, need to map based on which side of the ridge
      if (mouseY < canvas.height / 2) {
        // Front side of roof
        const distanceFromRidge = (canvas.height / 2 - mouseY) / scaleY;
        newPosition.z = -distanceFromRidge;
        
        // Calculate Y position based on roof pitch
        const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
        const ridgeHeight = dimensions.height + roofHeight;
        const ratio = distanceFromRidge / (dimensions.width / 2);
        
        // Linear interpolation between ridge height and eave height
        newPosition.y = ridgeHeight - (ratio * roofHeight);
      } else {
        // Back side of roof
        const distanceFromRidge = (mouseY - canvas.height / 2) / scaleY;
        newPosition.z = distanceFromRidge;
        
        // Calculate Y position based on roof pitch
        const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
        const ridgeHeight = dimensions.height + roofHeight;
        const ratio = distanceFromRidge / (dimensions.width / 2);
        
        // Linear interpolation between ridge height and eave height
        newPosition.y = ridgeHeight - (ratio * roofHeight);
      }
    } else { // Monopitch
      // For monopitch, map directly but adjust for the slope
      newPosition.z = (mouseY / scaleY) - (roofWidth / 2);
      
      // Calculate Y position based on roof pitch
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const highSideHeight = dimensions.height + roofHeight;
      const ratio = (newPosition.z + dimensions.width / 2) / dimensions.width;
      
      // Linear interpolation between high side and low side
      newPosition.y = highSideHeight - (ratio * roofHeight);
    }
    
    // Update element position
    updateRoofElement(selectedRoofElementId, { position: newPosition });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Helper function to find element at mouse position
  const findElementAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Set dimensions based on roof type
    const roofLength = dimensions.length;
    let roofWidth;
    
    if (roofType === RoofType.Flat) {
      roofWidth = dimensions.width;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
      roofWidth = slopeLength * 2;
    } else { // Monopitch
      // For monopitch roof, calculate the sloped width
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
    }
    
    // Scale factors
    const scaleX = canvas.width / roofLength;
    const scaleY = canvas.height / roofWidth;
    
    // Check each element
    for (const element of roofElements) {
      // Convert 3D position to 2D roof position
      let elementX, elementY;
      
      // Map x position directly to canvas x
      elementX = (element.position.x + roofLength / 2) * scaleX;
      
      // Map z position to canvas y
      if (roofType === RoofType.Flat) {
        elementY = (element.position.z + roofWidth / 2) * scaleY;
      } else if (roofType === RoofType.Gable) {
        // For gable roof, need to map based on which side of the ridge
        if (element.position.z < 0) {
          // Front side of roof
          const distanceFromRidge = Math.abs(element.position.z);
          elementY = (canvas.height / 2) - (distanceFromRidge * scaleY);
        } else {
          // Back side of roof
          const distanceFromRidge = Math.abs(element.position.z);
          elementY = (canvas.height / 2) + (distanceFromRidge * scaleY);
        }
      } else { // Monopitch
        // For monopitch, map z directly but adjust for the slope
        elementY = (element.position.z + roofWidth / 2) * scaleY;
      }
      
      // Element dimensions
      const width = element.dimensions.width * scaleX;
      const height = element.type === RoofElementType.RidgeSkylights 
        ? (element.dimensions.length || 1) * scaleX 
        : element.dimensions.width * scaleY;
      
      // Check if mouse is inside element
      if (element.type === RoofElementType.DomeSkylights) {
        // For dome skylights (circular)
        const distance = Math.sqrt(Math.pow(x - elementX, 2) + Math.pow(y - elementY, 2));
        if (distance <= width / 2) {
          return element;
        }
      } else {
        // For ridge skylights (rectangular)
        if (
          x >= elementX - width / 2 &&
          x <= elementX + width / 2 &&
          y >= elementY - height / 2 &&
          y <= elementY + height / 2
        ) {
          return element;
        }
      }
    }
    
    return null;
  };

  // Add a dome skylight
  const addDomeSkylight = () => {
    // Default position based on roof type
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Calculate Y position based on roof type
    if (roofType === RoofType.Flat) {
      position.y = dimensions.height + 0.01;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, place it on one side of the roof
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / (dimensions.width / 2));
      const yOffset = Math.sin(angle) * (dimensions.width / 4);
      
      position = {
        x: 0,
        y: dimensions.height + yOffset,
        z: -dimensions.width / 4
      };
      
      // Set rotation to match roof pitch
      rotation = { 
        x: angle, 
        y: 0, 
        z: 0 
      };
    } else if (roofType === RoofType.Monopitch) {
      // For monopitch roof, place it in the middle
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / dimensions.width);
      const yOffset = Math.sin(angle) * (dimensions.width / 2);
      
      position = {
        x: 0,
        y: dimensions.height + yOffset / 2,
        z: 0
      };
      
      // Set rotation to match roof pitch
      rotation = { 
        x: angle, 
        y: 0, 
        z: 0 
      };
    }
    
    const newElement = {
      id: `dome-skylight-${Date.now()}`,
      type: RoofElementType.DomeSkylights,
      position,
      rotation,
      dimensions: { width: 1.2, height: 0.5, depth: 1.2 },
      material: {
        id: 'polycarbonate',
        name: 'Polycarbonate',
        color: '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
      }
    };
    
    addRoofElement(newElement);
    selectRoofElement(newElement.id);
  };
  
  // Add a ridge skylight
  const addRidgeSkylight = () => {
    // Default position based on roof type
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Calculate Y position based on roof type
    if (roofType === RoofType.Flat) {
      position.y = dimensions.height + 0.01;
    } else if (roofType === RoofType.Gable) {
      // For gable roof, place it at the ridge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      position = {
        x: 0,
        y: dimensions.height + roofHeight,
        z: 0
      };
      // Align with building length
      rotation = { x: 0, y: 0, z: 0 };
    } else if (roofType === RoofType.Monopitch) {
      // For monopitch roof, place it at the higher edge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      position = {
        x: 0,
        y: dimensions.height + roofHeight,
        z: dimensions.width / 2
      };
      // Align with building length
      rotation = { x: 0, y: 0, z: 0 };
    }
    
    const newElement = {
      id: `ridge-skylight-${Date.now()}`,
      type: RoofElementType.RidgeSkylights,
      position,
      rotation,
      dimensions: { width: 1.5, height: 0.5, depth: 1.5, length: 5 },
      material: {
        id: 'polycarbonate',
        name: 'Polycarbonate',
        color: '#d4f1f9',
        roughness: 0.2,
        metalness: 0.1,
      }
    };
    
    addRoofElement(newElement);
    selectRoofElement(newElement.id);
  };
  
  // Fit canvas to container
  const fitToContainer = () => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const { width, height } = calculateCanvasDimensions();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Redraw canvas
    drawCanvas();
  };
  
  return (
    <div className="fixed inset-0 bg-dark-gray z-10 flex flex-col animate-fadeIn">
      <div className="bg-steel-blue p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <button 
            onClick={() => toggleRoofEditor(false)}
            className="mr-4 bg-dark-gray p-2 rounded-md hover:bg-black text-light-gray hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold flex items-center text-white">
            <Move className="h-5 w-5 mr-2 text-accent-yellow" /> Roof Editor
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fitToContainer}
            className="bg-dark-gray p-2 rounded-md hover:bg-black text-light-gray hover:text-white transition-colors mr-2"
            title="Fit to screen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-steel-blue p-4 border-r border-gray-700 overflow-y-auto">
          <h3 className="font-medium mb-3 text-accent-yellow">Add Elements</h3>
          <div className="space-y-2">
            <button
              onClick={addDomeSkylight}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Dome Skylight
            </button>
            <button
              onClick={addRidgeSkylight}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Ridge Skylight
            </button>
          </div>
          
          {selectedRoofElementId && (
            <div className="mt-6">
              <h3 className="font-medium mb-3 text-accent-yellow">Element Properties</h3>
              <RoofElementProperties 
                elementId={selectedRoofElementId} 
                buildingDimensions={dimensions}
                roofType={roofType}
                roofPitch={roofPitch}
              />
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-2 text-accent-yellow">Instructions</h3>
            <ul className="text-sm text-light-gray space-y-1">
              <li>• Click and drag elements to position them</li>
              <li>• Elements will automatically adjust to the roof slope</li>
              <li>• For gable roofs, the yellow line represents the ridge</li>
              <li>• Click the maximize button to fit the view to screen</li>
            </ul>
          </div>
        </div>
        
        <div 
          ref={containerRef} 
          className="flex-1 flex items-center justify-center bg-dark-gray p-4 overflow-hidden"
        >
          <div className="bg-steel-blue rounded-lg shadow-lg p-2 max-w-full max-h-full neumorphic">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-move"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Roof Element Properties Component
interface RoofElementPropertiesProps {
  elementId: string;
  buildingDimensions: {
    length: number;
    width: number;
    height: number;
    roofType: RoofType;
    roofPitch: number;
  };
  roofType: RoofType;
  roofPitch: number;
}

const RoofElementProperties: React.FC<RoofElementPropertiesProps> = ({ 
  elementId, 
  buildingDimensions,
  roofType,
  roofPitch
}) => {
  const { roofElements, updateRoofElement, removeRoofElement } = useBuildingStore();
  const element = roofElements.find(el => el.id === elementId);
  
  if (!element) return null;
  
  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...element.position };
    
    if (axis === 'x') {
      newPosition.x = value;
    } else if (axis === 'z') {
      newPosition.z = value;
      
      // Update Y position based on roof type and new Z position
      if (roofType === RoofType.Flat) {
        newPosition.y = buildingDimensions.height + 0.01;
      } else if (roofType === RoofType.Gable) {
        // For gable roof, calculate Y based on position relative to ridge
        const roofHeight = buildingDimensions.width * (roofPitch / 100);
        const ridgeHeight = buildingDimensions.height + roofHeight;
        const distanceFromCenter = Math.abs(value);
        const ratio = distanceFromCenter / (buildingDimensions.width / 2);
        
        // Linear interpolation between ridge height and eave height
        newPosition.y = ridgeHeight - (ratio * roofHeight);
      } else if (roofType === RoofType.Monopitch) {
        // For monopitch roof, calculate Y based on position along the slope
        const roofHeight = buildingDimensions.width * (roofPitch / 100);
        const highSideHeight = buildingDimensions.height + roofHeight;
        const ratio = (value + buildingDimensions.width / 2) / buildingDimensions.width;
        
        // Linear interpolation between high side and low side
        newPosition.y = highSideHeight - (ratio * roofHeight);
      }
    } else if (axis === 'y') {
      newPosition.y = value;
    }
    
    updateRoofElement(elementId, { position: newPosition });
  };
  
  const handleDimensionChange = (dim: 'width' | 'length', value: number) => {
    const newDimensions = { 
      ...element.dimensions, 
      [dim]: value 
    };
    
    updateRoofElement(elementId, { dimensions: newDimensions });
  };
  
  return (
    <div className="space-y-3 card-industrial p-3 rounded-lg">
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Type</label>
        <div className="text-sm font-medium bg-dark-gray p-2 rounded text-white">
          {element.type === RoofElementType.DomeSkylights ? 'Dome Skylight' : 'Ridge Skylight'}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">X Position (m)</label>
        <input
          type="range"
          min={-buildingDimensions.length / 2 + element.dimensions.width / 2}
          max={buildingDimensions.length / 2 - element.dimensions.width / 2}
          step={0.1}
          value={element.position.x}
          onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{(-buildingDimensions.length / 2 + element.dimensions.width / 2).toFixed(1)}</span>
          <span>{(buildingDimensions.length / 2 - element.dimensions.width / 2).toFixed(1)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Z Position (m)</label>
        <input
          type="range"
          min={-buildingDimensions.width / 2}
          max={buildingDimensions.width / 2}
          step={0.1}
          value={element.position.z}
          onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{(-buildingDimensions.width / 2).toFixed(1)}</span>
          <span>{(buildingDimensions.width / 2).toFixed(1)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Width (m)</label>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={element.dimensions.width}
          onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>0.5</span>
          <span>3.0</span>
        </div>
      </div>
      
      {element.type === RoofElementType.RidgeSkylights && (
        <div>
          <label className="block text-xs font-medium text-light-gray mb-1">Length (m)</label>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={element.dimensions.length || 1}
            onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value))}
            className="w-full accent-accent-yellow"
          />
          <div className="flex justify-between text-xs text-light-gray mt-1">
            <span>1.0</span>
            <span>20.0</span>
          </div>
        </div>
      )}
      
      <button
        onClick={() => removeRoofElement(elementId)}
        className="w-full mt-4 btn-danger text-sm flex items-center justify-center"
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete Element
      </button>
    </div>
  );
};

export default RoofEditor;