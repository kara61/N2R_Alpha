import * as THREE from 'three';

// Helper function to create a gable shape
export const createGableShape = (width: number, height: number): THREE.Shape => {
  const shape = new THREE.Shape();
  
  // Start at bottom left
  shape.moveTo(-width / 2, 0);
  // Bottom edge
  shape.lineTo(width / 2, 0);
  // Right edge up to peak
  shape.lineTo(0, height);
  // Close shape
  shape.lineTo(-width / 2, 0);
  
  return shape;
};

// Helper function to create a monopitch side wall shape
export const createMonopitchSideShape = (width: number, height: number, roofHeight: number): THREE.Shape => {
  const shape = new THREE.Shape();
  
  // Start at bottom left
  shape.moveTo(-width / 2, 0);
  // Bottom edge
  shape.lineTo(width / 2, 0);
  // Right edge up
  shape.lineTo(width / 2, height);
  // Top edge (sloped)
  shape.lineTo(-width / 2, height + roofHeight);
  // Left edge down
  shape.lineTo(-width / 2, 0);
  
  return shape;
};

// Helper function to create a monopitch back wall shape (including the triangular part)
export const createMonopitchBackWallShape = (width: number, height: number, roofHeight: number): THREE.Shape => {
  const shape = new THREE.Shape();
  
  // Start at bottom left
  shape.moveTo(-width / 2, 0);
  // Bottom edge
  shape.lineTo(width / 2, 0);
  // Right edge up
  shape.lineTo(width / 2, height + roofHeight);
  // Top edge
  shape.lineTo(-width / 2, height + roofHeight);
  // Left edge down
  shape.lineTo(-width / 2, 0);
  
  return shape;
};