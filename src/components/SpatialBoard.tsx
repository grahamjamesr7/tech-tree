// src/components/SpatialBoard.tsx
import React, { useState, useCallback, useEffect } from "react";
import StickyNote from "./StickyNote";
import ConnectionLine from "./ConnectionLine";

interface Position {
  x: number;
  y: number;
}

interface Note {
  id: number;
  x: number;
  y: number;
  content: string;
}

interface Connection {
  id: number;
  from: number;
  to?: number;
  fromPosition: Position;
  toPosition: Position;
}

interface ActiveConnection extends Omit<Connection, "to"> {
  to: undefined;
}

const SpatialBoard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [deletionArmedId, setDeletionArmedId] = useState<number | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnection, setActiveConnection] =
    useState<ActiveConnection | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (isDragging || activeConnection) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setNotes((prevNotes) => [
      ...prevNotes,
      {
        id: Date.now(),
        x,
        y,
        content: "",
      },
    ]);
  };

  const handleDragStart = (id: number): void => {
    setIsDragging(true);
    setDraggedId(id);
  };

  const handleNoteDrag = useCallback(
    (id: number, x: number, y: number): void => {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
      );

      setConnections((prevConnections) =>
        prevConnections.map((conn) => {
          if (conn.from === id) {
            return {
              ...conn,
              fromPosition: { x, y },
            };
          }
          if (conn.to === id) {
            return {
              ...conn,
              toPosition: { x, y },
            };
          }
          return conn;
        })
      );
    },
    []
  );

  const handleDragEnd = (): void => {
    setIsDragging(false);
    setDraggedId(null);
  };

  const handleNoteDelete = (id: number): void => {
    if (deletionArmedId === id) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setConnections((prevConnections) =>
        prevConnections.filter((conn) => conn.from !== id && conn.to !== id)
      );
      setDeletionArmedId(null);
    } else {
      setDeletionArmedId(id);
      setTimeout(() => setDeletionArmedId(null), 3000);
    }
  };

  const handleConnectionStart = (id: number, position: Position): void => {
    setActiveConnection({
      id: Date.now(),
      from: id,
      fromPosition: position,
      toPosition: position,
      to: undefined,
    });
  };

  const handleConnectionEnd = (id: number): void => {
    if (
      activeConnection &&
      activeConnection.from !== id &&
      !connections.some(
        (conn) =>
          (conn.from === activeConnection.from && conn.to === id) ||
          (conn.from === id && conn.to === activeConnection.from)
      )
    ) {
      const targetNote = notes.find((note) => note.id === id);
      if (targetNote) {
        setConnections((prev) => [
          ...prev,
          {
            id: activeConnection.id,
            from: activeConnection.from,
            fromPosition: activeConnection.fromPosition,
            to: id,
            toPosition: { x: targetNote.x, y: targetNote.y },
          },
        ]);
      }
    }
    setActiveConnection(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>): void => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.min(Math.max(z * delta, 0.1), 5));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      const boardElement = document.querySelector(".spatial-board");
      if (!boardElement) return;
      const rect = boardElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      if (isDragging && draggedId) {
        handleNoteDrag(draggedId, x, y);
      }

      if (activeConnection) {
        setActiveConnection((prev) =>
          prev
            ? {
                ...prev,
                toPosition: { x, y },
              }
            : null
        );
      }
    };

    const handleMouseUp = (): void => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedId, handleNoteDrag, zoom, activeConnection]);

  return (
    <div
      className="relative w-full h-screen bg-white overflow-hidden font-lato spatial-board"
      onClick={handleCanvasClick}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 bg-grid-pattern opacity-10"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      />

      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {connections.map((connection) => {
          const fromNote = notes.find((n) => n.id === connection.from);
          const toNote = notes.find((n) => n.id === connection.to);
          if (!fromNote || !toNote) return null;

          return (
            <ConnectionLine
              key={connection.id}
              start={connection.fromPosition}
              end={connection.toPosition}
            />
          );
        })}

        {activeConnection && (
          <ConnectionLine
            start={activeConnection.fromPosition}
            end={activeConnection.toPosition}
          />
        )}

        {notes.map((note) => (
          <StickyNote
            key={note.id}
            {...note}
            onDragStart={handleDragStart}
            onDrag={handleNoteDrag}
            onDragEnd={handleDragEnd}
            onDelete={handleNoteDelete}
            deletionArmed={deletionArmedId === note.id}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            isConnectionSource={activeConnection?.from === note.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SpatialBoard;
