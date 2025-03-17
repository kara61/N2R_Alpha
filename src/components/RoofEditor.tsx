import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { RoofElementType, RoofType } from '../types';
import { X, Move, ArrowLeft, Plus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Complete rewrite of the calculateRoofPosition function to fix the rotation issues
function calculateRoofPosition(
  canvasX: number, 
  canvasY: number, 
  canvas: HTMLCanvasElement,
  roofType: RoofType,
  dimensions: { length: number, width: number, height: number, roofPitch: number }
) {
  // Get roof dimensions
  const roofLength = dimensions.length;
  const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
  
  // Calculate different widths based on roof type
  let roofWidth;
  if (roofType === RoofType.Flat) {
    roofWidth = dimensions.width;
  } else if (roofType === RoofType.Gable) {
    const slopeLength = Math.sqrt(Math.pow(dimensions.width / 2, 2) + Math.pow(roofHeight, 2));
    roofWidth = slopeLength * 2;
  } else { // Monopitch
    roofWidth = Math.sqrt(Math.pow(dimensions.width, 2) + Math.pow(roofHeight, 2));
  }
  
  // Scale factors for converting canvas coordinates to 3D positions
  const scaleX = canvas.width / roofLength;
  const scaleY = canvas.height / roofWidth;
  
  // Convert canvas coordinates to 3D positions
  const x = (canvasX / scaleX) - (roofLength / 2);
  
  // Calculate z and y positions based on roof type
  let z = 0, y = 0;
  
  if (roofType === RoofType.Flat) {
    // For flat roof, direct mapping
    z = (canvasY / scaleY) - (roofWidth / 2);
    y = dimensions.height + 0.05; // Slightly above the roof
  } 
  else if (roofType === RoofType.Gable) {
    // For gable roof, need special handling for ridge
    if (canvasY < canvas.height / 2) {
      // Front side of the roof
      const distanceFromRidge = (canvas.height / 2 - canvasY) / scaleY;
      z = -distanceFromRidge;
      
      // Calculate height along the slope
      const halfWidth = dimensions.width / 2;
      const ratio = Math.min(distanceFromRidge / halfWidth, 1);
      y = dimensions.height + roofHeight - (ratio * roofHeight);
    } else {
      // Back side of the roof
      const distanceFromRidge = (canvasY - canvas.height / 2) / scaleY;
      z = distanceFromRidge;
      
      // Calculate height along the slope
      const halfWidth = dimensions.width / 2;
      const ratio = Math.min(distanceFromRidge / halfWidth, 1);
      y = dimensions.height + roofHeight - (ratio * roofHeight);
    }
    y += 0.05;
  } 
  else { // Monopitch
    // For monopitch roof, height varies linearly from high to low side
    const distanceFromHighEdge = canvasY / scaleY;
    z = (distanceFromHighEdge) - (roofWidth / 2);
    
    // Calculate height along the slope (high side = height + roofHeight, low side = height)
    const ratio = Math.min(distanceFromHighEdge / dimensions.width, 1);
    y = dimensions.height + roofHeight - (ratio * roofHeight);
    y += 0.05;
  }
  
  // Calculate rotation based on roof type to match the slope
  let rotationX = 0;
  
  if (roofType === RoofType.Gable) {
    const angle = Math.atan(roofHeight / (dimensions.width / 2));
    
    // For gable roof, the rotation direction needs to be inverted compared to what we might expect
    // because of how Three.js handles rotation around the x-axis
    rotationX = z < 0 ? -angle : angle;
  }
  else if (roofType === RoofType.Monopitch) {
    rotationX = -Math.atan(roofHeight / dimensions.width);
  }
  
  // Debug the calculation to make sure values are reasonable
  console.log(`Canvas position: (${canvasX}, ${canvasY}) -> 3D position: (${x}, ${y}, ${z}), rotation: (${rotationX}, 0, 0)`);
  
  return { 
    position: { x, y, z },
    rotation: { x: rotationX, y: 0, z: 0 }
  };
}

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
    
    // Draw roof elements with fixed ridge skylight orientation
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
      
      // Element dimensions - Use fixed dimensions for roof windows
      let width, height;
      
      if (element.type === RoofElementType.RidgeSkylights) {
        // Keep ridge skylights as is
        width = (element.dimensions.length || 3) * scaleX;
        height = element.dimensions.width * scaleY;
      } else if (element.type === RoofElementType.RoofWindow) {
        // Fixed size for roof windows: 1.3m x 1.3m
        width = 1.3 * scaleX;
        height = 1.3 * scaleY;
      }
      
      // Set colors based on element type - industrial theme
      let fillColor, strokeColor;
      
      fillColor = element.id === selectedRoofElementId ? '#F5A623' : '#d4f1f9';
      strokeColor = element.id === selectedRoofElementId ? '#F7B84B' : '#0066cc';
      
      // Draw element with industrial style
      ctx.fillStyle = fillColor;
      
      // Draw the element as a square with grid lines to represent window panes
      if (element.type === RoofElementType.RoofWindow) {
        // Draw the main square
        ctx.fillRect(x - width / 2, y - height / 2, width, height);
        
        // Draw outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = element.id === selectedRoofElementId ? 3 : 2;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);
        
        // Draw grid lines to show it's a window with panes
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Horizontal divider
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x + width / 2, y);
        // Vertical divider
        ctx.moveTo(x, y - height / 2);
        ctx.lineTo(x, y + height / 2);
        ctx.stroke();
      } else {
        // Ridge skylights remain the same
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
      ctx.fillText(element.type === RoofElementType.RoofWindow ? 'Window' : 'Ridge', x, y);
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
    
    // Check if mouse is over an element with wider hit area for easier selection
    const clickedElement = findElementAtPosition(mouseX, mouseY);
    
    if (clickedElement) {
      selectRoofElement(clickedElement.id);
      setIsDragging(true);
      
      // Log for debugging
      console.log(`Started dragging element ${clickedElement.id}`);
    } else {
      selectRoofElement(null);
    }
  };
  
  // Replace the handleMouseMove function with this improved version for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Skip if we're not dragging or no element is selected
    if (!isDragging || !selectedRoofElementId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get the element being dragged
    const element = roofElements.find(el => el.id === selectedRoofElementId);
    if (!element) return;
    
    // Calculate new position and rotation based on mouse position
    const { position, rotation } = calculateRoofPosition(
      mouseX, 
      mouseY, 
      canvas, 
      roofType, 
      dimensions
    );
    
    // Log the drag operation for debugging
    console.log(`Dragging to new position: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    
    // Apply updates based on element type
    if (element.type === RoofElementType.RoofWindow) {
      // For roof windows, update both position and rotation to match the roof slope
      updateRoofElement(selectedRoofElementId, { position, rotation });
    } else {
      // For ridge skylights, only update x and z position (keep y and rotation)
      const newPosition = {
        x: position.x,
        y: element.position.y, // Keep original y position
        z: position.z
      };
      updateRoofElement(selectedRoofElementId, { position: newPosition });
    }
  };
  
  const handleMouseUp = () => {
    if (isDragging && selectedRoofElementId) {
      console.log(`Finished dragging element ${selectedRoofElementId}`);
    }
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
    
    // Check each element with a slightly expanded hit area
    const hitAreaExpansion = 10; // pixels - increased for easier selection
    
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
      
      // Element dimensions - Fixed dimensions for dome skylights
      let width, height;
      
      if (element.type === RoofElementType.RidgeSkylights) {
        width = (element.dimensions.length || 3) * scaleX;
        height = element.dimensions.width * scaleY;
      } else if (element.type === RoofElementType.DomeSkylights) {
        // Fixed dimensions for dome skylights
        width = 1.3 * scaleX;
        height = 1.3 * scaleY;
      }
      
      // Check if mouse is inside element - all elements use the same hit test now
      if (
        x >= elementX - width / 2 - hitAreaExpansion &&
        x <= elementX + width / 2 + hitAreaExpansion &&
        y >= elementY - height / 2 - hitAreaExpansion &&
        y <= elementY + height / 2 + hitAreaExpansion
      ) {
        return element;
      }
    }
    
    return null;
  };

  // Fix the addRoofWindow function to properly set initial position and rotation
  const addRoofWindow = () => {
    // Get existing roof windows to determine where to place the new one
    const existingWindows = roofElements.filter(el => el.type === RoofElementType.RoofWindow);
    const windowCount = existingWindows.length;
    
    // Only vary the X position based on count, to prevent stacking
    const xOffset = windowCount * 2 - (Math.floor(windowCount / 3) * 6);
    
    // Calculate default Z position based on roof type
    let zPosition = 0;
    let yPosition = 0;
    let xRotation = 0;
    
    if (roofType === RoofType.Flat) {
      // For flat roof, place at center Z
      zPosition = 0;
      yPosition = dimensions.height + 0.1; // 10cm above roof
      xRotation = 0; // No rotation
    } 
    else if (roofType === RoofType.Gable) {
      // For gable roof, place on front slope
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / (dimensions.width / 2));
      
      zPosition = -dimensions.width / 4; // 1/4 of the way from ridge to eave
      
      // Calculate Y position to be on the roof slope
      const distanceFromRidge = Math.abs(zPosition);
      const halfWidth = dimensions.width / 2;
      const ratio = distanceFromRidge / halfWidth;
      yPosition = dimensions.height + roofHeight - (ratio * roofHeight) + 0.1;
      
      xRotation = -angle; // Negative rotation for front slope
    } 
    else { // Monopitch
      // For monopitch, place in the middle of the slope
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      const angle = Math.atan(roofHeight / dimensions.width);
      
      zPosition = 0; // Middle of roof width
      
      // Calculate Y position for this Z
      yPosition = dimensions.height + (roofHeight / 2) + 0.1;
      
      xRotation = -angle; // Match roof slope
    }
    
    // Create the new element
    const newElement = {
      id: `roof-window-${Date.now()}`,
      type: RoofElementType.RoofWindow,
      position: {
        x: xOffset,
        y: yPosition,
        z: zPosition
      },
      rotation: {
        x: xRotation,
        y: 0,
        z: 0
      },
      dimensions: { 
        width: 1.3,   // Fixed dimensions
        height: 0.08, 
        length: 1.3   
      },
      material: {
        id: 'glass',
        name: 'Glass',
        color: '#78c8ff',
        roughness: 0.1,
        metalness: 0.3,
      }
    };
    
    // Log the new element for debugging
    console.log(`Adding new roof window at: (${newElement.position.x.toFixed(2)}, ${newElement.position.y.toFixed(2)}, ${newElement.position.z.toFixed(2)})`);
    
    addRoofElement(newElement);
    selectRoofElement(newElement.id);
  };
  
  // Replace the addRidgeSkylight function with this improved version
  const addRidgeSkylight = () => {
    // Default position based on roof type
    let position, rotation;
    
    // Calculate default length (12m less than building length, but minimum 3m)
    const defaultLength = Math.max(3, dimensions.length - 12);
    
    if (roofType === RoofType.Flat) {
      // For flat roof, place in the middle
      position = { x: 0, y: dimensions.height + 0.05, z: 0 };
      rotation = { x: 0, y: 0, z: 0 };
    } 
    else if (roofType === RoofType.Gable) {
      // For gable roof, place along the ridge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      
      position = {
        x: 0,                           // Center along the length
        y: dimensions.height + roofHeight, // At the ridge height
        z: 0                            // At the ridge position
      };
      
      rotation = { x: 0, y: 0, z: 0 };  // No rotation needed along the ridge
    } 
    else { // Monopitch
      // For monopitch roof, place along the high edge
      const roofHeight = dimensions.width * (dimensions.roofPitch / 100);
      
      position = {
        x: 0,                           // Center along the length
        y: dimensions.height + roofHeight, // At the high edge
        z: -dimensions.width / 2        // At the high edge of the roof
      };
      
      rotation = { x: 0, y: 0, z: 0 };  // No rotation needed for ridge element
    }
    
    const newElement = {
      id: `ridge-skylight-${Date.now()}`,
      type: RoofElementType.RidgeSkylights,
      position,
      rotation,
      dimensions: { 
        width: 1.0,              // Width of the skylight
        height: 0.4,             // Height of the skylight
        length: defaultLength    // Length is now proportional to building
      },
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
              onClick={addRoofWindow}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Roof Window
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
  
  // Replace the handlePositionChange with this improved version
  const handlePositionChange = (axis: 'x' | 'z', value: number) => {
    // Get current element
    const element = roofElements.find(el => el.id === elementId);
    if (!element) return;
    
    const newPosition = { ...element.position };
    const newRotation = { ...element.rotation };
    
    if (axis === 'x') {
      // X position is simple - just update it
      newPosition.x = value;
    } 
    else if (axis === 'z') {
      // Z position needs to update Y as well, to stay on the roof surface
      newPosition.z = value;
      
      // Calculate Y position and rotation based on roof type
      if (roofType === RoofType.Flat) {
        // For flat roof, Y is just the roof height
        newPosition.y = buildingDimensions.height + 0.05; // Half of window thickness
      } 
      else if (roofType === RoofType.Gable) {
        // For gable roof, Y depends on distance from ridge
        const roofHeight = buildingDimensions.width * (roofPitch / 100);
        const ridgeHeight = buildingDimensions.height + roofHeight;
        const halfWidth = buildingDimensions.width / 2;
        
        // Calculate distance from ridge
        const distanceFromRidge = Math.abs(value);
        
        // Calculate ratio along the slope (0 at ridge, 1 at eave)
        const ratio = Math.min(distanceFromRidge / halfWidth, 1);
        
        // Calculate Y position 
        newPosition.y = ridgeHeight - (ratio * roofHeight);
        
        // Calculate rotation to match the roof slope
        if (element.type === RoofElementType.RoofWindow) {
          const angle = Math.atan(roofHeight / halfWidth);
          
          // FIXED: Front slope (negative Z) gets negative angle, back slope (positive Z) gets positive angle
          newRotation.x = value < 0 ? -angle : angle;
        }
        newPosition.y += 0.05;
      } 
      else { // Monopitch
        // For monopitch, Y depends on position along the slope
        const roofHeight = buildingDimensions.width * (roofPitch / 100);
        const highSideHeight = buildingDimensions.height + roofHeight;
        
        // Calculate ratio along the slope (0 at high side, 1 at low side)
        const ratio = Math.min((value + buildingDimensions.width / 2) / buildingDimensions.width, 1);
        
        // Calculate Y position
        newPosition.y = highSideHeight - (ratio * roofHeight);
        
        // Calculate rotation for roof windows
        if (element.type === RoofElementType.RoofWindow) {
          const angle = Math.atan(roofHeight / buildingDimensions.width);
          newRotation.x = -angle; // Same angle everywhere on monopitch
        }
        newPosition.y += 0.05;
      }
    }
    
    // Update with new position and rotation
    const updates: Partial<RoofElement> = { position: newPosition };
    
    // Always update rotation for roof windows to ensure they lie flat on the roof
    if (element.type === RoofElementType.RoofWindow) {
      updates.rotation = newRotation;
    }
    
    updateRoofElement(elementId, updates);
  };
  
  const handleDimensionChange = (dim: 'width' | 'length', value: number) => {
    // Only allow dimension changes for ridge skylights
    if (element.type === RoofElementType.DomeSkylights) {
      return; // Dome skylights have fixed dimensions now
    }
    
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
          {element.type === RoofElementType.RoofWindow ? 'Roof Window' : 'Ridge Skylight'}
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
      
      {/* Only show dimension controls for ridge skylights */}
      {element.type === RoofElementType.RidgeSkylights && (
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
      )}
      
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
      
      {/* Add dimension information for roof windows */}
      {element.type === RoofElementType.RoofWindow && (
        <div>
          <label className="block text-xs font-medium text-light-gray mb-1">Dimensions</label>
          <div className="bg-dark-gray p-2 rounded text-light-gray text-sm">
            Fixed size: 1.3m × 1.3m
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