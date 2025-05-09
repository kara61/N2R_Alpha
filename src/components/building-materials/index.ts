export * from './TextureFactory';
export * from './BuildingMaterialHooks';

// Re-export the main hooks with their original names for backward compatibility
export { useBuildingMaterials, useMonopitchWallMaterials } from './BuildingMaterialHooks';
