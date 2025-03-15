import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Viewport3D from './components/Viewport3D';
import ElementControls from './components/ElementControls';
import FacadeEditor from './components/FacadeEditor';
import RoofElementControls from './components/RoofElementControls';
import RoofEditor from './components/RoofEditor';
import { useBuildingStore } from './store/buildingStore';

function App() {
  const { 
    calculateStats, 
    selectedElementId, 
    selectedRoofElementId, 
    showFacadeEditor,
    showRoofEditor
  } = useBuildingStore();
  
  // Calculate initial stats when app loads
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-gray text-white">
      <Sidebar />
      <div className="flex-1 relative blueprint-bg">
        <Viewport3D />
        {selectedElementId && !showFacadeEditor && !showRoofEditor && <ElementControls />}
        {selectedRoofElementId && !showFacadeEditor && !showRoofEditor && <RoofElementControls />}
        {showFacadeEditor && <FacadeEditor />}
        {showRoofEditor && <RoofEditor />}
      </div>
    </div>
  );
}

export default App;