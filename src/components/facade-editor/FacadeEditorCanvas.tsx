import React, { useRef, useState, useEffect, useCallback } from 'react';
import { WallType, BuildingElement, ElementType, HallDimensions } from '../../types';
import { 
  calculateCanvasDimensions, 
  canvasToWallCoordinates, 
  wallToCanvasCoordinates,
  isPointInElement,
  getWallDimensions
} from './FacadeEditorUtils';

interface FacadeEditorCanvasProps {
  activeWall: WallType;
  elements: BuildingElement[];
  selectedElementId: string | null;
  dimensions: HallDimensions;
  yOffset: number;
  onSelectElement: (id: string | null) => void;
  onHoverElement: (id: string | null) => void;
  onPositionChange: (elementId: string, x: number, y: number) => void;
}

const FacadeEditorCanvas: React.FC<FacadeEditorCanvasProps> = ({
  activeWall,
  elements,
  selectedElementId,
  dimensions,
  yOffset,
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
  
  // Get elements on the active wall
  const wallElements = elements.filter(el => el.wall === activeWall);
  
  // Calculate and update canvas dimensions when necessary
  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height, scale } = calculateCanvasDimensions(
        containerRef.current,
        activeWall,
        dimensions
      );
      
      setCanvasDimensions({ width, height });
      setScale(scale);
      
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    }
  }, [activeWall, dimensions]);
  
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
    
    // Get wall dimensions
    const { wallWidth, wallHeight } = getWallDimensions(activeWall, dimensions);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines (every meter)
    for (let x = 0; x <= wallWidth; x++) {
      const { x: canvasX } = wallToCanvasCoordinates(
        x - wallWidth / 2, 
        0, 
        canvas.width, 
        canvas.height, 
        wallWidth, 
        wallHeight,
        yOffset
      );
      
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines (every meter)
    for (let y = 0; y <= wallHeight; y++) {
      const { y: canvasY } = wallToCanvasCoordinates(
        0, 
        y - wallHeight / 2, 
        canvas.width, 
        canvas.height, 
        wallWidth, 
        wallHeight,
        yOffset
      );
      
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(canvas.width, canvasY);
      ctx.stroke();
    }
    
    // Draw wall outline
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    wallElements.forEach(element => {
      const { x, y } = element.position;
      const { width, height } = element.dimensions;
      
      // Convert to canvas coordinates
      const { x: canvasX, y: canvasY } = wallToCanvasCoordinates(
        x, 
        y, 
        canvas.width, 
        canvas.height, 
        wallWidth, 
        wallHeight,
        yOffset
      );
      
      const canvasWidth = width * (canvas.width / wallWidth);
      const canvasHeight = height * (canvas.height / wallHeight);
      
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
      
      // Draw icon or label based on element type
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let label = '';
      switch (element.type) {
        case ElementType.Window:
          label = 'Window';
          break;
        case ElementType.Door:
          label = 'Door';
          break;
        case ElementType.SectionalDoor:
          label = 'Sect. Door';
          break;
        case ElementType.WindowedSectionalDoor:
          label = 'Wind. Door';
          break;
        case ElementType.LightBand:
          label = 'Light Band';
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
    
  }, [activeWall, dimensions, wallElements, selectedElementId, hoveredElementId, canvasDimensions, yOffset]);
  
  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get wall dimensions
    const { wallWidth, wallHeight } = getWallDimensions(activeWall, dimensions);
    
    // Check if mouse is over any element
    let isOverElement = false;
    
    for (const element of wallElements) {
      const { x, y } = element.position;
      const { width, height } = element.dimensions;
      
      // Convert to canvas coordinates
      const { x: canvasX, y: canvasY } = wallToCanvasCoordinates(
        x, 
        y, 
        canvas.width, 
        canvas.height, 
        wallWidth, 
        wallHeight,
        yOffset
      );
      
      const canvasWidth = width * (canvas.width / wallWidth);
      const canvasHeight = height * (canvas.height / wallHeight);
      
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
          // Convert mouse position to wall coordinates
          const { x: wallX, y: wallY } = canvasToWallCoordinates(
            mouseX,
            mouseY,
            canvas.width,
            canvas.height,
            wallWidth,
            wallHeight,
            yOffset
          );
          
          // Calculate bounds to keep element within wall
          const minX = -(wallWidth / 2) + (element.dimensions.width / 2);
          const maxX = (wallWidth / 2) - (element.dimensions.width / 2);
          const minY = -(wallHeight / 2) + (element.dimensions.height / 2) + yOffset;
          const maxY = (wallHeight / 2) - (element.dimensions.height / 2) + yOffset;
          
          // Constrain position within bounds
          const constrainedX = Math.max(minX, Math.min(maxX, wallX));
          const constrainedY = Math.max(minY, Math.min(maxY, wallY));
          
          // Update element position
          onPositionChange(element.id, constrainedX, constrainedY);
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
    
    // Get wall dimensions
    const { wallWidth, wallHeight } = getWallDimensions(activeWall, dimensions);
    
    // Check if mouse is over any element
    let clickedElement: string | null = null;
    
    for (const element of wallElements) {
      const { x, y } = element.position;
      const { width, height } = element.dimensions;
      
      // Convert to canvas coordinates
      const { x: canvasX, y: canvasY } = wallToCanvasCoordinates(
        x, 
        y, 
        canvas.width, 
        canvas.height, 
        wallWidth, 
        wallHeight,
        yOffset
      );
      
      const canvasWidth = width * (canvas.width / wallWidth);
      const canvasHeight = height * (canvas.height / wallHeight);
      
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
      />
    </div>
  );
};

export default FacadeEditorCanvas;
