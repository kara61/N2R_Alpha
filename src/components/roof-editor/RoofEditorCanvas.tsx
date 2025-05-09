import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RoofType, RoofElement, RoofElementType, HallDimensions } from '../../types';
import { 
  calculateCanvasDimensions, 
  calculateRoofPosition,
  isPointInRoofElement
} from './RoofEditorUtils';

interface RoofEditorCanvasProps {
  roofElements: RoofElement[];
  selectedElementId: string | null;
  dimensions: HallDimensions;
  onSelectElement: (id: string | null) => void;
  onHoverElement: (id: string | null) => void;
  onPositionChange: (elementId: string, x: number, z: number) => void;
}

const RoofEditorCanvas: React.FC<RoofEditorCanvasProps> = ({
  roofElements,
  selectedElementId,
  dimensions,
  onSelectElement,
  onHoverElement,
  onPositionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  const { roofType, roofPitch } = dimensions;
  
  // Calculate and update canvas dimensions when necessary
  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height, scale } = calculateCanvasDimensions(
        containerRef.current,
        roofType,
        dimensions
      );
      
      setCanvasDimensions({ width, height });
      setScale(scale);
      
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    }
  }, [roofType, dimensions]);
  
  // Initialize and set up resize listener
  useEffect(() => {
    updateCanvasDimensions();
    
    const handleResize = () => {
      updateCanvasDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasDimensions]);
  
  // Draw the canvas when dimensions, elements, or selection changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw roof outline based on roof type
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    
    if (roofType === RoofType.Flat) {
      // Flat roof is just a rectangle
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);
      
    } else if (roofType === RoofType.Gable) {
      // For gable roof, draw the two faces with a ridge
      const ridgeY = canvas.height / 2;
      
      // Draw the grid on both faces
      drawGrid(ctx, canvas.width, canvas.height);
      
      // Draw the ridge line
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, ridgeY);
      ctx.lineTo(canvas.width, ridgeY);
      ctx.stroke();
      
      // Draw the outline
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
    } else if (roofType === RoofType.Monopitch) {
      // Monopitch is a simple rectangle with a gradient
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient to show the slope
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(102, 102, 102, 0.5)');
      gradient.addColorStop(1, 'rgba(102, 102, 102, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);
    }
    
    // Draw roof elements
    roofElements.forEach(element => {
      const { length: buildingLength, width: buildingWidth } = dimensions;
      const roofHeight = buildingWidth * (roofPitch / 100);
      
      // Calculate canvas position based on element's 3D position
      let canvasX, canvasY;
      
      // X is common for all roof types - along the building length
      canvasX = ((element.position.x + buildingLength / 2) / buildingLength) * canvas.width;
      
      if (roofType === RoofType.Flat) {
        // For flat roof, Z directly maps to Y on canvas
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      } 
      else if (roofType === RoofType.Gable) {
        // For gable roof, need to handle the two slopes
        if (element.position.z < 0) {
          // Front slope - map 0 to -width/2 onto height/2 to 0
          const normalizedZ = (element.position.z + buildingWidth / 2) / (buildingWidth / 2);
          canvasY = (1 - normalizedZ) * (canvas.height / 2);
        } else {
          // Back slope - map 0 to width/2 onto height/2 to height
          const normalizedZ = element.position.z / (buildingWidth / 2);
          canvasY = (canvas.height / 2) + normalizedZ * (canvas.height / 2);
        }
      } 
      else if (roofType === RoofType.Monopitch) {
        // For monopitch, Z maps to Y directly but shifted
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      }
      
      // Calculate canvas dimensions of the element
      let canvasWidth, canvasHeight;
      
      if (element.type === RoofElementType.RidgeSkylights) {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = ((element.dimensions.length || 1.0) / buildingWidth) * canvas.height;
        
        // Adjust for gable roof orientation
        if (roofType === RoofType.Gable) {
          canvasHeight = ((element.dimensions.length || 1.0) / (buildingWidth / 2)) * (canvas.height / 4);
        }
      } else {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = (element.dimensions.width / buildingWidth) * canvas.height; // Using width for height as well for simplicity
      }
      
      // Draw element background
      ctx.fillStyle = element.id === selectedElementId 
        ? 'rgba(65, 155, 249, 0.6)' // Selected color
        : element.id === hoveredElementId 
          ? 'rgba(65, 155, 249, 0.3)' // Hovered color
          : 'rgba(200, 200, 200, 0.3)'; // Default color
      
      ctx.fillRect(
        canvasX - canvasWidth / 2,
        canvasY - canvasHeight / 2,
        canvasWidth,
        canvasHeight
      );
      
      // Draw element border
      ctx.strokeStyle = element.id === selectedElementId 
        ? '#419bf9' // Selected color
        : element.id === hoveredElementId 
          ? '#5dabf9' // Hovered color
          : '#cccccc'; // Default color
      
      ctx.lineWidth = element.id === selectedElementId ? 2 : 1;
      
      ctx.strokeRect(
        canvasX - canvasWidth / 2,
        canvasY - canvasHeight / 2,
        canvasWidth,
        canvasHeight
      );
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let label = '';
      switch (element.type) {
        case RoofElementType.RoofWindow:
          label = 'Window';
          break;
        case RoofElementType.RidgeSkylights:
          label = 'Skylight';
          break;
      }
      
      // Draw label if element is large enough
      if (canvasWidth > 40 && canvasHeight > 20) {
        ctx.fillText(
          label,
          canvasX,
          canvasY
        );
      }
    });
    
  }, [roofType, dimensions, roofElements, selectedElementId, hoveredElementId, canvasDimensions, roofPitch]);
  
  // Draw grid helper function
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = width / 10; // 10 divisions along width
    
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };
  
  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any element
    let isOverElement = false;
    
    for (const element of roofElements) {
      const { length: buildingLength, width: buildingWidth } = dimensions;
      const roofHeight = buildingWidth * (roofPitch / 100);
      
      // Calculate canvas position based on element's 3D position
      let canvasX, canvasY;
      
      // X is common for all roof types - along the building length
      canvasX = ((element.position.x + buildingLength / 2) / buildingLength) * canvas.width;
      
      if (roofType === RoofType.Flat) {
        // For flat roof, Z directly maps to Y on canvas
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      } 
      else if (roofType === RoofType.Gable) {
        // For gable roof, need to handle the two slopes
        if (element.position.z < 0) {
          // Front slope - map 0 to -width/2 onto height/2 to 0
          const normalizedZ = (element.position.z + buildingWidth / 2) / (buildingWidth / 2);
          canvasY = (1 - normalizedZ) * (canvas.height / 2);
        } else {
          // Back slope - map 0 to width/2 onto height/2 to height
          const normalizedZ = element.position.z / (buildingWidth / 2);
          canvasY = (canvas.height / 2) + normalizedZ * (canvas.height / 2);
        }
      } 
      else if (roofType === RoofType.Monopitch) {
        // For monopitch, Z maps to Y directly but shifted
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      }
      
      // Calculate canvas dimensions of the element
      let canvasWidth, canvasHeight;
      
      if (element.type === RoofElementType.RidgeSkylights) {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = ((element.dimensions.length || 1.0) / buildingWidth) * canvas.height;
        
        // Adjust for gable roof orientation
        if (roofType === RoofType.Gable) {
          canvasHeight = ((element.dimensions.length || 1.0) / (buildingWidth / 2)) * (canvas.height / 4);
        }
      } else {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = (element.dimensions.width / buildingWidth) * canvas.height;
      }
      
      // Check if mouse is inside this element
      if (
        mouseX >= canvasX - canvasWidth / 2 &&
        mouseX <= canvasX + canvasWidth / 2 &&
        mouseY >= canvasY - canvasHeight / 2 &&
        mouseY <= canvasY + canvasHeight / 2
      ) {
        // Mouse is over this element
        isOverElement = true;
        
        // Update hovered element if changed
        if (hoveredElementId !== element.id) {
          setHoveredElementId(element.id);
          onHoverElement(element.id);
        }
        
        // If dragging and this is the selected element, update its position
        if (isDragging && selectedElementId === element.id) {
          // Convert mouse position to roof coordinates
          const { x, y, z } = calculateRoofPosition(
            mouseX,
            mouseY,
            canvas,
            roofType,
            dimensions
          );
          
          // Update element position
          onPositionChange(element.id, x, z);
        }
        
        break;
      }
    }
    
    // If not over any element, clear hovered element
    if (!isOverElement && hoveredElementId !== null) {
      setHoveredElementId(null);
      onHoverElement(null);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if mouse is over any element
    let clickedElement: string | null = null;
    
    for (const element of roofElements) {
      const { length: buildingLength, width: buildingWidth } = dimensions;
      
      // Calculate canvas position based on element's 3D position
      let canvasX, canvasY;
      
      // X is common for all roof types - along the building length
      canvasX = ((element.position.x + buildingLength / 2) / buildingLength) * canvas.width;
      
      if (roofType === RoofType.Flat) {
        // For flat roof, Z directly maps to Y on canvas
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      } 
      else if (roofType === RoofType.Gable) {
        // For gable roof, need to handle the two slopes
        if (element.position.z < 0) {
          // Front slope - map 0 to -width/2 onto height/2 to 0
          const normalizedZ = (element.position.z + buildingWidth / 2) / (buildingWidth / 2);
          canvasY = (1 - normalizedZ) * (canvas.height / 2);
        } else {
          // Back slope - map 0 to width/2 onto height/2 to height
          const normalizedZ = element.position.z / (buildingWidth / 2);
          canvasY = (canvas.height / 2) + normalizedZ * (canvas.height / 2);
        }
      } 
      else if (roofType === RoofType.Monopitch) {
        // For monopitch, Z maps to Y directly but shifted
        canvasY = ((element.position.z + buildingWidth / 2) / buildingWidth) * canvas.height;
      }
      
      // Calculate canvas dimensions of the element
      let canvasWidth, canvasHeight;
      
      if (element.type === RoofElementType.RidgeSkylights) {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = ((element.dimensions.length || 1.0) / buildingWidth) * canvas.height;
        
        // Adjust for gable roof orientation
        if (roofType === RoofType.Gable) {
          canvasHeight = ((element.dimensions.length || 1.0) / (buildingWidth / 2)) * (canvas.height / 4);
        }
      } else {
        canvasWidth = (element.dimensions.width / buildingLength) * canvas.width;
        canvasHeight = (element.dimensions.width / buildingWidth) * canvas.height;
      }
      
      // Check if mouse is inside this element
      if (
        mouseX >= canvasX - canvasWidth / 2 &&
        mouseX <= canvasX + canvasWidth / 2 &&
        mouseY >= canvasY - canvasHeight / 2 &&
        mouseY <= canvasY + canvasHeight / 2
      ) {
        // Clicked on this element
        clickedElement = element.id;
        break;
      }
    }
    
    // Select clicked element or deselect if clicked on empty space
    onSelectElement(clickedElement);
    
    // Start dragging if clicked on an element
    if (clickedElement) {
      setIsDragging(true);
    }
  };
  
  const handleMouseUp = () => {
    // Stop dragging
    setIsDragging(false);
  };
  
  // Allow positioning outside of canvas and stop dragging
  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredElementId(null);
    onHoverElement(null);
  };
  
  // Get mouse position and convert to roof coordinates when clicking on empty space
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Check if clicked on empty space
    if (!hoveredElementId) {
      // Convert mouse position to roof coordinates for reference
      const { x, y, z } = calculateRoofPosition(
        mouseX,
        mouseY,
        canvas,
        roofType,
        dimensions
      );
      
      // For debugging purposes or adding elements at click position
      console.log(`Roof position: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}`);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 flex justify-center items-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="border border-gray-700 bg-slate-900"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default RoofEditorCanvas;
