import React, { useState, useCallback, useEffect } from 'react';
import StickyNote from './components/StickyNote';
import ConnectionLine from './components/ConnectionLine';



const SpatialBoard = () => {
  const [notes, setNotes] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [deletionArmedId, setDeletionArmedId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const handleCanvasClick = (e) => {
    if (activeConnection) {
      setActiveConnection(null);
      return;
    }
    if (isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setNotes([...notes, {
      id: Date.now(),
      x,
      y,
      content: ''
    }]);
  };

  const handleDragStart = (id) => {
    setIsDragging(true);
    setDraggedId(id);
  };

  const handleNoteDrag = useCallback((id, x, y) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === id ? { ...note, x, y } : note
      )
    );
  }, []);

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  const handleNoteDelete = (id) => {
    if (deletionArmedId === id) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      setConnections(prevConnections => 
        prevConnections.filter(conn => conn.from !== id && conn.to !== id)
      );
      setDeletionArmedId(null);
    } else {
      setDeletionArmedId(id);
      setTimeout(() => setDeletionArmedId(null), 3000);
    }
  };

  const handleConnectionStart = (id, position) => {
    console.debug(id, position);
    setActiveConnection({
      from: id,
      fromPosition: position,
      toPosition: position
    });
  };

  const handleConnectionEnd = (id, p) => {
    console.debug("End!", id);
    if (activeConnection && activeConnection.from !== id) {
      // Check if connection already exists between these nodes (in either direction)
      const connectionExists = connections.some(conn => 
      (conn.from === activeConnection.from && conn.to === id) ||
      (conn.from === id && conn.to === activeConnection.from)
      );
      
      if (!connectionExists) {
      setConnections(prev => [...prev, {
        id: Date.now(),
        from: activeConnection.from,
        to: id,
        startPos: activeConnection.fromPosition,
        endPos: p
      }]);
      }
      else {
        console.warn("connection already exists!")
      }
    }
    setActiveConnection(null);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(Math.max(z * delta, 0.1), 5));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = document.querySelector('.spatial-board').getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      
      if (isDragging && draggedId) {
        handleNoteDrag(draggedId, x, y);
      }
      
      if (activeConnection) {
        setActiveConnection(prev => ({
          ...prev,
          toPosition: { x, y }
        }));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedId, handleNoteDrag, zoom, activeConnection]);

  useEffect(() => {
    console.debug({activeConnection});
    console.debug({connections})
  }, [activeConnection, connections])

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
          .font-lato { font-family: 'Lato', sans-serif; }
        `}
      </style>
      <div 
        className="relative w-full h-screen bg-white overflow-hidden font-lato spatial-board" 
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      >
        <div 
          className="absolute inset-0 bg-grid-pattern opacity-10"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        />
        
        <div style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'relative',
          width: '100%',
          height: '100%'
        }}>
          {/* Connection lines container */}
          <div className="absolute inset-0">
            {connections.map(connection => {
              const fromNote = notes.find(n => n.id === connection.from);
              const toNote = notes.find(n => n.id === connection.to);
              if (!fromNote || !toNote) return null;
              
                return (
                <ConnectionLine
                  key={connection.id}
                  start={{ x: connection.startPos.x, y: connection.startPos.y }}
                  end={{ x: connection.endPos.x, y: connection.endPos.y }}
                  onDelete={() => setConnections(prev => prev.filter(conn => conn.id !== connection.id))}
                />
                );
            })}
            
            {/* Active connection being drawn */}
            {activeConnection && (
              <ConnectionLine
                start={activeConnection.fromPosition}
                end={activeConnection.toPosition}
              />
            )}
          </div>

          {/* Sticky notes */}
          {notes.map(note => (
            <StickyNote
              key={note.id}
              {...note}
              onDragStart={handleDragStart}
              onDrag={handleNoteDrag}
              onDragEnd={handleDragEnd}
              onDelete={handleNoteDelete}
              deletionArmed={deletionArmedId === note.id}
              handleClicked={(i, p) => activeConnection ? handleConnectionEnd(note.id, p) : handleConnectionStart(note.id, p)}
              beingConnected={activeConnection != null && activeConnection.from === note.id}
            />
          ))}
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="w-screen h-screen">
      <SpatialBoard />
    </div>
  )
}

export default App