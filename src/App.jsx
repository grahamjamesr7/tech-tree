import React from 'react';
import SpatialBoardV2 from './components/SpatialBoard';
import GlobalToolbar from './components/GlobalToolbar';

function App() {
  return (
    <div className="w-screen h-screen">
      <SpatialBoardV2 />
      <GlobalToolbar/>
    </div>
  )
}

export default App