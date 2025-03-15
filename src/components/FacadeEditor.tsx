import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { WallType, ElementType } from '../types';
import { X, Move, ArrowLeft, Compass, Plus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const FacadeEditor: React.FC = () => {
  const { 
    dimensions, 
    elements, 
    selectedElementId, 
    updateElement, 
    selectElement,
    toggleFacadeEditor,
    addElement,
    removeElement
  } = useBuildingStore();
  
  const [activeWall, setActiveWall] = useState<WallType>(WallType.North);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Y-axis offset in meters
  const Y_OFFSET = -1;
  
  // Get elements on the active wall
  const wallElements = elements.filter(el => el.wall === activeWall);

  // Calculate canvas dimensions based on container size
  const calculateCanvasDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    
    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth - 40; // Subtract padding
    const containerHeight = containerRef.current.clientHeight - 40;
    
    // Get wall dimensions
    let wallWidth, wallHeight;
    if (activeWall === WallType.North || activeWall === WallType.South) {
      wallWidth = dimensions.length;
      wallHeight = dimensions.height;
    } else {
      wallWidth = dimensions.width;
      wallHeight = dimensions.height;
    }
    
    // We only want to show exactly the building height (no extra space)
    // We'll use a fixed Y offset so the ground is at the bottom of the canvas
    const effectiveHeight = wallHeight;
    
    // Calculate aspect ratio using the actual wall dimensions
    const wallRatio = wallWidth / effectiveHeight;
    const containerRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerRatio > wallRatio) {
      // Container is wider than needed, height is the limiting factor
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * wallRatio;
    } else {
      // Container is taller than needed, width is the limiting factor
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / wallRatio;
    }
    
    return {
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasHeight)
    };
  }, [activeWall, dimensions]);
  
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
  
  // Update canvas when active wall changes
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const { width, height } = calculateCanvasDimensions();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Redraw canvas
    drawCanvas();
  }, [activeWall, calculateCanvasDimensions]);
  
  // Draw the facade
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions based on wall
    let wallWidth, wallHeight;
    if (activeWall === WallType.North || activeWall === WallType.South) {
      wallWidth = dimensions.length;
      wallHeight = dimensions.height;
    } else {
      wallWidth = dimensions.width;
      wallHeight = dimensions.height;
    }
    
    // FIXED: We're now showing exactly the building height
    // Remove the Y_OFFSET from the canvas scaling so that the ground is exactly at the bottom
    const scaleX = canvas.width / wallWidth;
    const scaleY = canvas.height / wallHeight; // The canvas height now represents exactly the building height
    
    // Draw wall background with exact building dimensions
    ctx.fillStyle = '#2B3A42';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw scale reference - 1 meter grid
    ctx.strokeStyle = '#3A4A52';
    ctx.lineWidth = 0.5;
    
    // Add scale reference text every 5 meters horizontally
    ctx.fillStyle = '#6B8A92';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    // Vertical grid lines with measurement labels (every meter)
    for (let x = 0; x <= wallWidth; x++) {
      const canvasX = x * scaleX;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, canvas.height);
      ctx.stroke();
      
      // Add labels every 5m
      if (x % 5 === 0) {
        ctx.fillText(`${x}m`, canvasX, canvas.height - 5);
      }
    }
    
    // Horizontal grid lines - FIXED to match building height precisely
    for (let y = 0; y <= wallHeight; y++) {
      // The Y position is calculated from the bottom (ground level)
      const canvasY = canvas.height - (y * scaleY);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(canvas.width, canvasY);
      ctx.stroke();
      
      // Add height labels every meter
      if (y % 1 === 0) {
        ctx.fillStyle = '#6B8A92';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${y}m`, 5, canvasY - 2);
      }
    }
    
    // FIXED: Draw ground line at the bottom of the canvas exactly
    const groundY = canvas.height; // Ground is exactly at canvas.height now
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Add visual scale indicator - human figure for reference (1.8m tall)
    const humanHeight = 1.8 * scaleY; // 1.8 meters tall
    const humanX = 40;
    
    // Draw simple human figure silhouette
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    // Head
    ctx.beginPath();
    ctx.arc(humanX, groundY - humanHeight + 15, 15, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.moveTo(humanX, groundY - humanHeight + 30);
    ctx.lineTo(humanX, groundY - 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(humanX, groundY - 50);
    ctx.lineTo(humanX - 10, groundY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(humanX, groundY - 50);
    ctx.lineTo(humanX + 10, groundY);
    ctx.stroke();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('1.8m', humanX, groundY - humanHeight / 2);
    
    // Draw structural columns
    const maxColumnSpacing = 5; // Maximum 5m between columns
    const columnsLength = Math.max(2, Math.ceil(wallWidth / maxColumnSpacing));
    const actualSpacing = wallWidth / (columnsLength - 1);
    
    ctx.fillStyle = '#555555';
    
    if (activeWall === WallType.North || activeWall === WallType.South) {
      // Draw columns along the wall
      for (let i = 0; i < columnsLength; i++) {
        const x = i * actualSpacing * scaleX;
        const columnWidth = 0.3 * scaleX;
        ctx.fillRect(x - columnWidth / 2, 0, columnWidth, canvas.height);
      }
    } else {
      // For East/West walls, draw columns at top and bottom
      const columnWidth = 0.3 * scaleX;
      ctx.fillRect(0, 0, columnWidth, canvas.height); // Left column
      ctx.fillRect(canvas.width - columnWidth, 0, columnWidth, canvas.height); // Right column
      
      // Draw intermediate columns if any
      const columnsWidth = Math.max(2, Math.ceil(dimensions.width / maxColumnSpacing));
      const actualWidthSpacing = dimensions.width / (columnsWidth - 1);
      
      for (let i = 1; i < columnsWidth - 1; i++) {
        const z = i * actualWidthSpacing;
        const x = (z / dimensions.width) * canvas.width;
        ctx.fillRect(x - columnWidth / 2, 0, columnWidth, canvas.height);
      }
    }
    
    // Draw elements with proper proportional sizing
    wallElements.forEach(element => {
      // Convert 3D position to 2D facade position
      let x, y;
      
      if (activeWall === WallType.North) {
        x = (element.position.x + wallWidth / 2) * scaleX;
        // Y position is calculated from the ground up
        y = groundY - (element.position.y * scaleY);
      } else if (activeWall === WallType.South) {
        x = (wallWidth / 2 - element.position.x) * scaleX;
        y = groundY - (element.position.y * scaleY);
      } else if (activeWall === WallType.East) {
        x = (element.position.z + wallWidth / 2) * scaleX;
        y = groundY - (element.position.y * scaleY);
      } else { // West
        x = (wallWidth / 2 - element.position.z) * scaleX;
        y = groundY - (element.position.y * scaleY);
      }
      
      // Element dimensions - use consistent scaling
      const width = element.dimensions.width * scaleX;
      const height = element.dimensions.height * scaleY;
      
      // Set colors based on element type - industrial theme
      let fillColor, strokeColor;
      
      switch (element.type) {
        case ElementType.Window:
          fillColor = element.id === selectedElementId ? '#F5A623' : '#a3c6e8';
          strokeColor = element.id === selectedElementId ? '#F7B84B' : '#0066cc';
          break;
        case ElementType.Door:
          fillColor = element.id === selectedElementId ? '#F5A623' : '#4a4a4a';
          strokeColor = element.id === selectedElementId ? '#F7B84B' : '#333333';
          break;
        case ElementType.SectionalDoor:
          fillColor = element.id === selectedElementId ? '#F5A623' : '#5a5a5a';
          strokeColor = element.id === selectedElementId ? '#F7B84B' : '#333333';
          break;
        case ElementType.LightBand:
          fillColor = element.id === selectedElementId ? '#F5A623' : '#e0e0e0';
          strokeColor = element.id === selectedElementId ? '#F7B84B' : '#999999';
          break;
        default:
          fillColor = element.id === selectedElementId ? '#F5A623' : '#aaccff';
          strokeColor = element.id === selectedElementId ? '#F7B84B' : '#0066cc';
      }
      
      // Draw doors and windows with consistent proportions and detailed visualizations
      if (element.type === ElementType.Door || 
          element.type === ElementType.SectionalDoor || 
          element.type === ElementType.WindowedSectionalDoor) {
        
        // Use ground level as reference point
        const doorBottomY = groundY;
        
        // Calculate door position and size in canvas coordinates
        const doorWidth = element.dimensions.width * scaleX;
        const doorHeight = element.dimensions.height * scaleY;
        const doorTopY = doorBottomY - doorHeight;
        
        // Draw door with proper dimensions
        ctx.fillStyle = fillColor;
        ctx.fillRect(x - doorWidth / 2, doorTopY, doorWidth, doorHeight);
        
        // Draw door outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = element.id === selectedElementId ? 3 : 2;
        ctx.strokeRect(x - doorWidth / 2, doorTopY, doorWidth, doorHeight);
        
        // Add realistic door details based on type
        if (element.type === ElementType.Door) {
          // Standard door details
          
          // Door frame
          ctx.strokeStyle = "#444444";
          ctx.lineWidth = 1;
          ctx.strokeRect(x - doorWidth / 2 + 2, doorTopY + 2, doorWidth - 4, doorHeight - 4);
          
          // Door handle
          ctx.fillStyle = "#aaaaaa";
          ctx.beginPath();
          ctx.arc(x + doorWidth / 4, doorBottomY - doorHeight / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Door labels with dimensions
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`Regular Door`, x, doorTopY + doorHeight / 2 - 10);
          ctx.font = "10px monospace";
          ctx.fillText(`${element.dimensions.width.toFixed(1)}m × ${element.dimensions.height.toFixed(1)}m`, 
                      x, doorTopY + doorHeight / 2 + 10);
        } 
        else if (element.type === ElementType.SectionalDoor || element.type === ElementType.WindowedSectionalDoor) {
          // Sectional door has horizontal panels
          const panels = 4; // Number of horizontal panels
          const panelHeight = doorHeight / panels;
          
          // Draw panels
          ctx.strokeStyle = "#444444";
          ctx.lineWidth = 1;
          
          for (let i = 1; i < panels; i++) {
            const panelY = doorTopY + (i * panelHeight);
            ctx.beginPath();
            ctx.moveTo(x - doorWidth / 2, panelY);
            ctx.lineTo(x + doorWidth / 2, panelY);
            ctx.stroke();
          }
          
          // Add vertical frame lines
          ctx.beginPath();
          ctx.moveTo(x - doorWidth / 2 + 5, doorTopY);
          ctx.lineTo(x - doorWidth / 2 + 5, doorBottomY);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(x + doorWidth / 2 - 5, doorTopY);
          ctx.lineTo(x + doorWidth / 2 - 5, doorBottomY);
          ctx.stroke();
          
          // Add windows for WindowedSectionalDoor
          if (element.type === ElementType.WindowedSectionalDoor) {
            // Add row of windows in the upper part
            const windowTopRow = doorTopY + panelHeight * 0.5;
            const windowWidth = doorWidth / 6;
            const windowHeight = panelHeight * 0.6;
            
            ctx.fillStyle = "#a3c6e8"; // Light blue for windows
            
            for (let i = 0; i < 4; i++) {
              const windowX = x - (doorWidth / 3) + (i * windowWidth * 1.5);
              ctx.fillRect(windowX - windowWidth / 2, windowTopRow - windowHeight / 2, windowWidth, windowHeight);
              
              // Window frame
              ctx.strokeRect(windowX - windowWidth / 2, windowTopRow - windowHeight / 2, windowWidth, windowHeight);
            }
          }
          
          // Door handle/control unit
          ctx.fillStyle = "#777777";
          ctx.fillRect(x - doorWidth / 10, doorBottomY - panelHeight / 2, doorWidth / 5, panelHeight / 4);
          
          // Door labels with dimensions
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px Arial";
          ctx.textAlign = "center";
          ctx.fillText(element.type === ElementType.SectionalDoor ? "Sectional Door" : "Windowed Sectional Door", 
                      x, doorTopY + 15);
          ctx.font = "10px monospace";
          ctx.fillText(`${element.dimensions.width.toFixed(1)}m × ${element.dimensions.height.toFixed(1)}m`, 
                      x, doorTopY + 30);
        }
        
        // Add measurement guides specifically for doors when selected
        if (element.id === selectedElementId) {
          // Vertical height guide
          ctx.strokeStyle = "#22cc44"; // Green guide
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 3]); // Dashed line
          
          // Draw height guide line
          ctx.beginPath();
          ctx.moveTo(x + doorWidth / 2 + 10, doorTopY);
          ctx.lineTo(x + doorWidth / 2 + 10, doorBottomY);
          ctx.stroke();
          
          // Add height arrows
          ctx.beginPath();
          ctx.moveTo(x + doorWidth / 2 + 5, doorTopY);
          ctx.lineTo(x + doorWidth / 2 + 15, doorTopY);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(x + doorWidth / 2 + 5, doorBottomY);
          ctx.lineTo(x + doorWidth / 2 + 15, doorBottomY);
          ctx.stroke();
          
          // Height label
          ctx.fillStyle = "#22cc44";
          ctx.font = "10px monospace";
          ctx.textAlign = "left";
          ctx.fillText(`${element.dimensions.height.toFixed(1)}m`, x + doorWidth / 2 + 15, doorTopY + doorHeight / 2);
          
          // Reset line dash
          ctx.setLineDash([]);
          
          // Draw bottom edge indicator
          ctx.strokeStyle = "#D32F2F";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - doorWidth / 2 - 10, doorBottomY);
          ctx.lineTo(x + doorWidth / 2 + 10, doorBottomY);
          ctx.stroke();
          
          // Bottom edge label
          ctx.fillStyle = "#D32F2F";
          ctx.font = "10px Arial";
          ctx.fillText("Ground Level", x, doorBottomY + 15);
          
          // Proportional relationship to building
          const buildingHeight = dimensions.height;
          const proportion = (element.dimensions.height / buildingHeight * 100).toFixed(0);
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "9px monospace";
          ctx.fillText(`${proportion}% of building height`, x, doorTopY - 5);
        }
      } 
      // Other elements like windows and light bands
      else {
        // Use the same consistent scale for other elements
        ctx.fillStyle = fillColor;
        ctx.fillRect(x - width / 2, y - height, width, height);
        
        // Draw outline
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = element.id === selectedElementId ? 3 : 2;
        ctx.strokeRect(x - width / 2, y - height, width, height);
        
        // Element label with dimensions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${element.type} (${element.dimensions.width.toFixed(1)}x${element.dimensions.height.toFixed(1)}m)`, 
                     x, y - height/2);
      }
      
      // For selected elements, add additional info
      if (element.id === selectedElementId) {
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 2;
        
        // Draw selection box
        const drawY = element.type.includes("Door") ? groundY - height : y;
        
        // Draw bottom edge indicator
        ctx.beginPath();
        ctx.moveTo(x - width / 2, element.type.includes("Door") ? groundY : y);
        ctx.lineTo(x + width / 2, element.type.includes("Door") ? groundY : y);
        ctx.stroke();
      }
    });
    
    // Draw a scale legend
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Scale Reference:', canvas.width - 180, 20);
    
    // Draw 1m scale bar
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 160, 40);
    ctx.lineTo(canvas.width - 160 + 1 * scaleX, 40);
    ctx.stroke();
    ctx.fillText('1 meter', canvas.width - 150, 45);
    
    // Draw 2m scale bar
    ctx.beginPath();  
    ctx.moveTo(canvas.width - 160, 60);
    ctx.lineTo(canvas.width - 160 + 2 * scaleX, 60);
    ctx.stroke();
    ctx.fillText('2 meters', canvas.width - 150, 65);
    
    // After drawing all elements, add a scale comparison box
    // This will help show the proportional relationship between doors and standard heights
    ctx.fillStyle = "rgba(100,100,100,0.2)";
    ctx.fillRect(60, groundY - 100, 80, 100); // 100px-tall box (representing ~2m)

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Scale Reference", 65, groundY - 85);

    // Door height references
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;

    // Regular door height line (2.1m)
    const regDoorHeight = 2.1 * scaleY;
    ctx.beginPath();
    ctx.moveTo(70, groundY - regDoorHeight);
    ctx.lineTo(90, groundY - regDoorHeight);
    ctx.stroke();
    ctx.fillText("Door: 2.1m", 95, groundY - regDoorHeight);

    // Sectional door height line (3.0m)
    const sectDoorHeight = 3.0 * scaleY;
    ctx.beginPath();
    ctx.moveTo(70, groundY - sectDoorHeight);
    ctx.lineTo(90, groundY - sectDoorHeight);
    ctx.stroke();
    ctx.fillText("Sect. Door: 3.0m", 95, groundY - sectDoorHeight);

    // Human height line (1.8m) - FIXED: Use the existing humanHeight variable
    ctx.beginPath();
    ctx.moveTo(70, groundY - humanHeight);
    ctx.lineTo(90, groundY - humanHeight);
    ctx.stroke();
    ctx.fillText("Human: 1.8m", 95, groundY - humanHeight);
    
  }, [activeWall, dimensions, elements, selectedElementId, wallElements, Y_OFFSET]);
  
  // Update canvas when relevant state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, activeWall, dimensions, elements, selectedElementId]);
  
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
      selectElement(clickedElement.id);
      setIsDragging(true);
    } else {
      selectElement(null);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedElementId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert canvas position to 3D position
    let wallWidth, wallHeight;
    if (activeWall === WallType.North || activeWall === WallType.South) {
      wallWidth = dimensions.length;
      wallHeight = dimensions.height;
    } else {
      wallWidth = dimensions.width;
      wallHeight = dimensions.height;
    }
    
    const scaleX = canvas.width / wallWidth;
    const scaleY = canvas.height / wallHeight;
    
    // Get the element to determine its height
    const element = elements.find(el => el.id === selectedElementId);
    if (!element) return;
    
    // Calculate new position based on wall
    let newPosition = { ...element.position };
    
    if (activeWall === WallType.North) {
      newPosition = {
        x: (mouseX / scaleX) - (wallWidth / 2),
        y: (canvas.height - mouseY) / scaleY, // Adjusted to remove Y_OFFSET
        z: -dimensions.width / 2
      };
    } else if (activeWall === WallType.South) {
      newPosition = {
        x: (wallWidth / 2) - (mouseX / scaleX),
        y: (canvas.height - mouseY) / scaleY,
        z: dimensions.width / 2
      };
    } else if (activeWall === WallType.East) {
      newPosition = {
        x: dimensions.length / 2,
        y: (canvas.height - mouseY) / scaleY,
        z: (mouseX / scaleX) - (wallWidth / 2)
      };
    } else { // West
      newPosition = {
        x: -dimensions.length / 2,
        y: (canvas.height - mouseY) / scaleY,
        z: (wallWidth / 2) - (mouseX / scaleX)
      };
    }
    
    // Ensure Y position is never below element's half-height (to keep it above ground)
    newPosition.y = Math.max(element.dimensions.height / 2, newPosition.y);
    
    // Ensure the element is not placed too high
    newPosition.y = Math.min(newPosition.y, dimensions.height - 0.1);
    
    // Update element position
    updateElement(selectedElementId, { position: newPosition });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Helper function to find element at mouse position
  const findElementAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Set dimensions based on wall
    let wallWidth, wallHeight;
    if (activeWall === WallType.North || activeWall === WallType.South) {
      wallWidth = dimensions.length;
      wallHeight = dimensions.height;
    } else {
      wallWidth = dimensions.width;
      wallHeight = dimensions.height;
    }
    
    // Scale factors
    const scaleX = canvas.width / wallWidth;
    const scaleY = canvas.height / wallHeight;
    
    // Check each element
    for (const element of wallElements) {
      // Convert 3D position to 2D facade position
      let elementX, elementY;
      
      if (activeWall === WallType.North) {
        elementX = (element.position.x + wallWidth / 2) * scaleX;
        elementY = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else if (activeWall === WallType.South) {
        elementX = (wallWidth / 2 - element.position.x) * scaleX;
        elementY = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else if (activeWall === WallType.East) {
        elementX = (element.position.z + wallWidth / 2) * scaleX;
        elementY = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else { // West
        elementX = (wallWidth / 2 - element.position.z) * scaleX;
        elementY = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      }
      
      // Element dimensions
      const width = element.dimensions.width * scaleX;
      const height = element.dimensions.height * scaleY;
      
      // Check if mouse is inside element
      if (
        x >= elementX - width / 2 &&
        x <= elementX + width / 2 &&
        y >= elementY - height &&
        y <= elementY
      ) {
        return element;
      }
    }
    
    return null;
  };

  // Find a suitable position for a new element to avoid overlapping
  const findSuitablePosition = (type: ElementType, elementWidth: number) => {
    // Default position is at the center
    let xPosition = 0;
    
    // Get wall width
    const wallWidth = activeWall === WallType.North || activeWall === WallType.South 
      ? dimensions.length 
      : dimensions.width;
    
    // If there are existing elements on this wall, find a position that doesn't overlap
    if (wallElements.length > 0) {
      // Try different positions along the wall
      const positions = [-wallWidth/4, wallWidth/4, -wallWidth/3, wallWidth/3, -2, 2, 0];
      
      // Find the first position that doesn't overlap with existing elements
      for (const pos of positions) {
        let overlaps = false;
        
        for (const element of wallElements) {
          let elementX;
          
          if (activeWall === WallType.North || activeWall === WallType.South) {
            elementX = element.position.x;
          } else {
            elementX = element.position.z;
          }
          
          // Check if the new position would overlap with this element
          if (Math.abs(pos - elementX) < (elementWidth + element.dimensions.width) / 2) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          xPosition = pos;
          break;
        }
      }
      
      // If all positions overlap, offset from the last element
      if (xPosition === 0 && wallElements.length > 0) {
        const lastElement = wallElements[wallElements.length - 1];
        let lastX;
        
        if (activeWall === WallType.North || activeWall === WallType.South) {
          lastX = lastElement.position.x;
        } else {
          lastX = lastElement.position.z;
        }
        
        // Place new element to the right of the last one with some spacing
        xPosition = lastX + lastElement.dimensions.width / 2 + elementWidth / 2 + 0.5;
        
        // If this would place it outside the wall, try the left side
        if (xPosition > wallWidth / 2 - elementWidth / 2) {
          xPosition = lastX - lastElement.dimensions.width / 2 - elementWidth / 2 - 0.5;
          
          // If still outside, place at a random position
          if (xPosition < -wallWidth / 2 + elementWidth / 2) {
            xPosition = Math.random() * (wallWidth - elementWidth) - (wallWidth - elementWidth) / 2;
          }
        }
      }
    }
    
    return xPosition;
  };

  // Generate a new element
  const addNewElement = (type: ElementType) => {
    // Default materials based on element type
    const materials = {
      [ElementType.Window]: {
        id: 'glass',
        name: 'Glass',
        color: '#a3c6e8',
        roughness: 0.1,
        metalness: 0.9,
      },
      [ElementType.Door]: {
        id: 'door',
        name: 'Door',
        color: '#4a4a4a',
        roughness: 0.7,
        metalness: 0.3,
      },
      [ElementType.SectionalDoor]: {
        id: 'sectionalDoor',
        name: 'Sectional Door',
        color: '#5a5a5a',
        roughness: 0.6,
        metalness: 0.4,
      },
      [ElementType.WindowedSectionalDoor]: {
        id: 'windowedSectionalDoor',
        name: 'Windowed Sectional Door',
        color: '#5a5a5a',
        roughness: 0.6,
        metalness: 0.4,
      },
      [ElementType.LightBand]: {
        id: 'lightBand',
        name: 'Light Band',
        color: '#e0e0e0',
        roughness: 0.2,
        metalness: 0.1,
      },
    };

    // Default dimensions based on element type
    const elementDimensions = {
      [ElementType.Window]: { width: 1.2, height: 1.0, depth: 0.1 },
      [ElementType.Door]: { width: 1.0, height: 2.1, depth: 0.1 },
      [ElementType.SectionalDoor]: { width: 3.0, height: 3.0, depth: 0.2 },
      [ElementType.WindowedSectionalDoor]: { width: 3.0, height: 3.0, depth: 0.2 },
      [ElementType.LightBand]: { width: 2.0, height: 0.5, depth: 0.1 },
    };

    // Get element dimensions for positioning
    const elementWidth = elementDimensions[type].width;
    const elementHeight = elementDimensions[type].height;
    
    // Find a suitable X position that doesn't overlap with existing elements
    const xPosition = findSuitablePosition(type, elementWidth);
    
    // Calculate Y position based on element type - ONE SINGLE DECLARATION
    let yPosition;
    
    // Different positioning logic for different element types
    if (type === ElementType.Door || type === ElementType.SectionalDoor || type === ElementType.WindowedSectionalDoor) {
      // All doors should have their bottom edge at ground level (y=0)
      // Position is at center, so we add half the height to get from bottom to center
      yPosition = elementHeight / 2;
      console.log(`Positioning ${type} with height ${elementHeight} at Y=${yPosition} (bottom at y=0)`);
    } else if (type === ElementType.LightBand) {
      // Special case for light bands - position them higher up on the wall
      yPosition = 5.3; // Set light bands at 5.3m height
    } else {
      // Default placement for windows and other elements
      yPosition = elementHeight / 2; // Center at half height
    }
    
    // Calculate wall offset
    const wallOffset = 0.5;
    const wallThickness = 0.15;
    const elementOffset = wallThickness / 2 + 0.01;
    
    // Define position and rotation
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    switch (activeWall) {
      case WallType.North:
        position = { 
          x: xPosition, 
          y: yPosition, 
          z: -dimensions.width / 2 - wallOffset - elementOffset
        };
        rotation = { x: 0, y: Math.PI, z: 0 };
        break;
      case WallType.South:
        position = { 
          x: xPosition, 
          y: yPosition, 
          z: dimensions.width / 2 + wallOffset + elementOffset
        };
        rotation = { x: 0, y: 0, z: 0 }; // No rotation needed, already facing outward
        break;
      case WallType.East:
        position = { 
          x: dimensions.length / 2 + wallOffset + elementOffset, 
          y: yPosition, 
          z: xPosition 
        };
        rotation = { x: 0, y: -Math.PI / 2, z: 0 }; // Rotate -90 degrees to face outward
        break;
      case WallType.West:
        position = { 
          x: -dimensions.length / 2 - wallOffset - elementOffset, 
          y: yPosition, 
          z: xPosition 
        };
        rotation = { x: 0, y: Math.PI / 2, z: 0 }; // Rotate 90 degrees to face outward
        break;
    }

    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      rotation,
      dimensions: elementDimensions[type],
      material: materials[type],
      wall: activeWall
    };

    addElement(newElement);
    selectElement(newElement.id);

    // Calculate stats after adding element
    useBuildingStore.getState().calculateStats();
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
            onClick={() => toggleFacadeEditor(false)}
            className="mr-4 bg-dark-gray p-2 rounded-md hover:bg-black text-light-gray hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold flex items-center text-white">
            <Move className="h-5 w-5 mr-2 text-accent-yellow" /> Facade Editor
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addNewElement(ElementType.WindowedSectionalDoor)}
            className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Windowed Sectional Door
          </button>
          <button
            onClick={fitToContainer}
            className="bg-dark-gray p-2 rounded-md hover:bg-black text-light-gray hover:text-white transition-colors mr-2"
            title="Fit to screen"
          >
            <Maximize className="h-5 w-5" />
          </button>
          
          <div className="flex items-center bg-dark-gray rounded-md p-1">
            <Compass className="h-4 w-4 mx-2 text-accent-yellow" />
            <div className="flex">
              {Object.values(WallType).map(wall => (
                <button
                  key={wall}
                  onClick={() => setActiveWall(wall)}
                  className={`px-3 py-1 rounded-md text-sm ${activeWall === wall ? 'bg-accent-yellow text-dark-gray' : 'text-light-gray hover:bg-black'}`}
                >
                  {wall}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-steel-blue p-4 border-r border-gray-700 overflow-y-auto">
          <h3 className="font-medium mb-3 text-accent-yellow">Add Elements</h3>
          <div className="space-y-2">
            <button
              onClick={() => addNewElement(ElementType.Window)}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Window
            </button>
            <button
              onClick={() => addNewElement(ElementType.Door)}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Door
            </button>
            <button
              onClick={() => addNewElement(ElementType.SectionalDoor)}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Sectional Door
            </button>
            <button
              onClick={() => addNewElement(ElementType.LightBand)}
              className="w-full bg-dark-gray hover:bg-black text-light-gray font-medium py-2 px-3 rounded flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 text-accent-yellow" /> Light Band
            </button>
          </div>
          
          {selectedElementId && (
            <div className="mt-6">
              <h3 className="font-medium mb-3 text-accent-yellow">Element Properties</h3>
              <ElementProperties 
                elementId={selectedElementId} 
                wall={activeWall}
                buildingDimensions={dimensions}
                yOffset={Y_OFFSET}
              />
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="font-medium mb-2 text-accent-yellow">Instructions</h3>
            <ul className="text-sm text-light-gray space-y-1">
              <li>• Click and drag elements to position them</li>
              <li>• The red line shows the bottom edge of the element</li>
              <li>• Gray columns represent structural elements</li>
              <li>• Y=0 is at ground level (with -1m offset in display)</li>
              <li>• Elements can't go below ground level</li>
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

// Element Properties Component
interface ElementPropertiesProps {
  elementId: string;
  wall: WallType;
  buildingDimensions: {
    length: number;
    width: number;
    height: number;
    roofType: string;
    roofPitch: number;
  };
  yOffset: number;
}

const ElementProperties: React.FC<ElementPropertiesProps> = ({ elementId, wall, buildingDimensions, yOffset }) => {
  const { elements, updateElement, removeElement } = useBuildingStore();
  const element = elements.find(el => el.id === elementId);
  
  if (!element) return null;
  
  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const newPosition = { ...element.position };
    
    if (axis === 'x') {
      if (wall === WallType.North || wall === WallType.South) {
        newPosition.x = value;
      } else {
        newPosition.z = value;
      }
    } else if (axis === 'y') {
      // Ensure Y position is never below element's half-height
      newPosition.y = Math.max(element.dimensions.height / 2, value);
    }
    
    updateElement(elementId, { position: newPosition });
  };
  
  const handleDimensionChange = (dim: 'width' | 'height', value: number) => {
    const newDimensions = { 
      ...element.dimensions, 
      [dim]: value 
    };
    
    // Update position if height changes to keep bottom at same level
    if (dim === 'height') {
      const bottomY = element.position.y - element.dimensions.height / 2;
      const newY = bottomY + value / 2;
      
      updateElement(elementId, { 
        dimensions: newDimensions,
        position: { ...element.position, y: newY }
      });
    } else {
      updateElement(elementId, { dimensions: newDimensions });
    }
  };
  
  // Calculate the bottom edge Y position
  const bottomEdgeY = element.position.y - element.dimensions.height / 2;
  // Display value with offset for UI
  const displayBottomEdgeY = bottomEdgeY + yOffset;
  
  return (
    <div className="space-y-3 card-industrial p-3 rounded-lg">
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Type</label>
        <div className="text-sm font-medium bg-dark-gray p-2 rounded text-white">
          {element.type}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">
          {wall === WallType.North || wall === WallType.South ? 'X Position' : 'Z Position'} (m)
        </label>
        <input
          type="range"
          min={-buildingDimensions.length / 2 + element.dimensions.width / 2}
          max={buildingDimensions.length / 2 - element.dimensions.width / 2}
          step={0.1}
          value={wall === WallType.North || wall === WallType.South ? element.position.x : element.position.z}
          onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{(-buildingDimensions.length / 2 + element.dimensions.width / 2).toFixed(1)}</span>
          <span>{(buildingDimensions.length / 2 - element.dimensions.width / 2).toFixed(1)}</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Y Position (m)</label>
        <input
          type="range"
          min={element.dimensions.height / 2}
          max={buildingDimensions.height - 0.1}
          step={0.1}
          value={element.position.y}
          onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>{(element.dimensions.height / 2).toFixed(1)}</span>
          <span>{(buildingDimensions.height - 0.1).toFixed(1)}</span>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-3 h-3 bg-accent-red mr-1"></div>
          <p className="text-xs text-light-gray">
            Bottom edge: <span className="font-mono">{displayBottomEdgeY.toFixed(2)}m</span> (display) / <span className="font-mono">{bottomEdgeY.toFixed(2)}m</span> (actual)
          </p>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Width (m)</label>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.1}
          value={element.dimensions.width}
          onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>0.5</span>
          <span>5.0</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-light-gray mb-1">Height (m)</label>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={element.dimensions.height}
          onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value))}
          className="w-full accent-accent-yellow"
        />
        <div className="flex justify-between text-xs text-light-gray mt-1">
          <span>0.5</span>
          <span>3.0</span>
        </div>
      </div>
      
      <button
        onClick={() => removeElement(elementId)}
        className="w-full mt-4 btn-danger text-sm flex items-center justify-center"
      >
        <Trash2 className="h-4 w-4 mr-1" /> Delete Element
      </button>
    </div>
  );
};

export default FacadeEditor;