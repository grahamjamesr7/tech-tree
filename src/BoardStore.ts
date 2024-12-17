// src/store/boardStore.ts
import { create } from "zustand";
import { STICKY_COLORS, StickyNoteColor } from "./constants";

type Side = "top" | "right" | "bottom" | "left";

interface Note {
  id: number;
  x: number;
  y: number;
  content: string;
}

interface Connection {
  id: number;
  fromId: number;
  fromSide: Side;
  toId: number;
  toSide: Side;
}

interface ActiveConnection {
  fromId: number;
  fromSide: Side;
}

interface BoardSettings {
  confirmDeletes: boolean;
  defaultStickyColor: StickyNoteColor;
}

const DEFAULT_SETTINGS: BoardSettings = {
  confirmDeletes: true,
  defaultStickyColor: STICKY_COLORS[0],
};

interface BoardState {
  // State
  notes: Note[];
  connections: Connection[];
  zoom: number;
  activeConnection: ActiveConnection | null;
  settings: BoardSettings;

  // Note Actions
  addNote: (x: number, y: number) => void;
  updateNotePosition: (id: number, x: number, y: number) => void;
  updateNoteContent: (id: number, content: string) => void;
  deleteNote: (id: number) => void;

  // Connection Actions
  startConnection: (fromId: number, fromSide: Side) => void;
  endConnection: (toId: number, toSide: Side) => void;
  cancelConnection: () => void;
  deleteConnection: (connectionId: number) => void;

  // Settings actions
  changeSettings: (newSettings: BoardSettings) => void;

  // View Actions
  setZoom: (zoom: number) => void;
  clearBoard: () => void;
}

const useBoardStore = create<BoardState>((set) => ({
  // Initial State
  notes: [],
  connections: [],
  zoom: 1,
  activeConnection: null,
  settings: DEFAULT_SETTINGS,

  // Note Actions
  addNote: (x, y) => {
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: Date.now(),
          x,
          y,
          content: "",
        },
      ],
    }));
  },

  updateNotePosition: (id, x, y) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, x, y } : note
      ),
    })),

  updateNoteContent: (id, content) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, content } : note
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      connections: state.connections.filter(
        (conn) => conn.fromId !== id && conn.toId !== id
      ),
    })),

  // Connection Actions
  startConnection: (fromId, fromSide) => {
    set({
      activeConnection: { fromId, fromSide },
    });
  },

  endConnection: (toId, toSide) => {
    set((state) => {
      if (!state.activeConnection || state.activeConnection.fromId === toId) {
        return {};
      }

      // Check if connection already exists
      const connectionExists = state.connections.some(
        (conn) =>
          (conn.fromId === state.activeConnection!.fromId &&
            conn.toId === toId) ||
          (conn.fromId === toId && conn.toId === state.activeConnection!.fromId)
      );

      if (connectionExists) {
        return { activeConnection: null };
      }
      return {
        connections: [
          ...state.connections,
          {
            id: Date.now(),
            fromId: state.activeConnection.fromId,
            fromSide: state.activeConnection.fromSide,
            toId,
            toSide,
          },
        ],
        activeConnection: null,
      };
    });
  },

  cancelConnection: () =>
    set({
      activeConnection: null,
    }),

  deleteConnection: (connectionId) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== connectionId),
    })),

  changeSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  // View Actions
  setZoom: (zoom) => set({ zoom }),
  clearBoard: () =>
    set(() => ({
      notes: [],
      connections: [],
      activeConnection: null,
    })),
}));

// Helper function to get connection point coordinates
export const getConnectionPoint = (
  note: Note,
  side: Side
): { x: number; y: number } => {
  switch (side) {
    case "top":
      return { x: note.x, y: note.y - 96 };
    case "right":
      return { x: note.x + 96, y: note.y };
    case "bottom":
      return { x: note.x, y: note.y + 96 };
    case "left":
      return { x: note.x - 96, y: note.y };
  }
};

export type { Note, Connection, Side, ActiveConnection };
export default useBoardStore;
