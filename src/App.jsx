import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import GridStage from './components/GridStage';
import { useState } from 'react';
import './App.css';

function App() {
  const [shapes, setShapes] = useState([]);

  const handleAddShape = (shapeType) => {
    const newShape = { 
      id: `${shapeType}-${Date.now()}`, 
      type: shapeType, 
      x: 50, // Initial x position
      y: 50, // Initial y position
      size: 50 // Size can be adjusted based on shape type
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
  };

  return (
    <div className="flex h-screen p-4 gap-4">
      <LeftSidebar onAddShape={handleAddShape} />
      <div className="flex-grow">
        <GridStage shapes={shapes} />
      </div>
      <RightSidebar />
    </div>
  );
}

export default App;
