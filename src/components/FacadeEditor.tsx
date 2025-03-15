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
    
    // Calculate aspect ratio
    const wallRatio = wallWidth / wallHeight;
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
    
    // Scale factors
    const scaleX = canvas.width / wallWidth;
    const scaleY = canvas.height / wallHeight;
    
    // Draw wall - industrial style with darker background
    ctx.fillStyle = '#2B3A42';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw blueprint grid
    ctx.strokeStyle = '#3A4A52';
    ctx.lineWidth = 0.5;
    
    // Vertical grid lines (every meter)
    for (let x = 0; x <= wallWidth; x++) {
      const canvasX = x * scaleX;
      ctx.beginPath();
      ctx.moveTo(canvasX, 0);
      ctx.lineTo(canvasX, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines (every meter)
    for (let y = 0; y <= wallHeight; y++) {
      const canvasY = canvas.height - ((y + Y_OFFSET) * scaleY);
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(canvas.width, canvasY);
      ctx.stroke();
    }
    
    // Draw ground line with stronger emphasis
    const groundY = canvas.height - (Y_OFFSET * scaleY);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    
    // Draw structural elements (columns)
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
    
    // Draw elements
    wallElements.forEach(element => {
      // Convert 3D position to 2D facade position
      let x, y;
      
      if (activeWall === WallType.North) {
        x = (element.position.x + wallWidth / 2) * scaleX;
        y = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else if (activeWall === WallType.South) {
        x = (wallWidth / 2 - element.position.x) * scaleX;
        y = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else if (activeWall === WallType.East) {
        x = (element.position.z + wallWidth / 2) * scaleX;
        y = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      } else { // West
        x = (wallWidth / 2 - element.position.z) * scaleX;
        y = canvas.height - ((element.position.y + Y_OFFSET) * scaleY);
      }
      
      // Element dimensions
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
      
      // Draw element with industrial style
      ctx.fillStyle = fillColor;
      ctx.fillRect(x - width / 2, y - height, width, height);
      
      // Draw outline with metallic look
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = element.id === selectedElementId ? 3 : 2;
      ctx.strokeRect(x - width / 2, y - height, width, height);
      
      // Draw element type label with technical font
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(element.type, x, y - height / 2);
      
      // Draw bottom edge indicator if selected
      if (element.id === selectedElementId) {
        ctx.strokeStyle = '#D32F2F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x + width / 2, y);
        ctx.stroke();
        
        // Label the bottom edge
        ctx.fillStyle = '#D32F2F';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Bottom edge', x + width / 2 + 5, y);
      }
    });
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
        y: (canvas.height - mouseY) / scaleY - Y_OFFSET,
        z: -dimensions.width / 2
      };
    } else if (activeWall === WallType.South) {
      newPosition = {
        x: (wallWidth / 2) - (mouseX / scaleX),
        y: (canvas.height - mouseY) / scaleY - Y_OFFSET,
        z: dimensions.width / 2
      };
    } else if (activeWall === WallType.East) {
      newPosition = {
        x: dimensions.length / 2,
        y: (canvas.height - mouseY) / scaleY - Y_OFFSET,
        z: (mouseX / scaleX) - (wallWidth / 2)
      };
    } else { // West
      newPosition = {
        x: -dimensions.length / 2,
        y: (canvas.height - mouseY) / scaleY - Y_OFFSET,
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

    // Get element height for proper positioning
    const elementHeight = elementDimensions[type].height;
    const elementWidth = elementDimensions[type].width;
    
    // Find a suitable X position that doesn't overlap with existing elements
    const xPosition = findSuitablePosition(type, elementWidth);
    
    // Default position based on wall
    let position = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 0, z: 0 };
    
    // Calculate wall offset
    const wallOffset = 0.5;
    const wallThickness = 0.15;
    const elementOffset = wallThickness / 2 + 0.01;
    
    // Set initial Y position based on element type
    let yPosition = elementHeight / 2; // Default for most elements
    
    // Special case for light bands - position them higher up on the wall
    if (type === ElementType.LightBand) {
      yPosition = 5.3; // Set light bands at 5.9m height
    }
    
    switch (activeWall) {
      case WallType.North:
        position = { 
          x: xPosition, 
          y: yPosition, 
          z: -dimensions.width / 2 - wallOffset - elementOffset
        };
        rotation = { x: 0, y: Math.PI, z: 0 }; // Rotate 180 degrees to face outward
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