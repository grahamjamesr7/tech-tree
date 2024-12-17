import React, { useState, useCallback, useEffect } from 'react';
// import StickyNote from './components/StickyNote';
// import ConnectionLine from './components/ConnectionLine';
import SpatialBoardV2 from './components/SpatialBoard';

function App() {
  return (
    <div className="w-screen h-screen">
      <SpatialBoardV2 />
    </div>
  )
}

export default App