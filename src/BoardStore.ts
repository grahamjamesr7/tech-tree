// src/store/boardStore.ts
import { create } from "zustand";
import { STICKY_COLORS, StickyNoteColor } from "./constants";

type Side = "top" | "right" | "bottom" | "left";

type StickySize =
  | "trivial"
  | "extra-small"
  | "small"
  | "medium"
  | "large"
  | "extra-large"
  | "too-big";

interface Note {
  id: number;
  x: number;
  y: number;
  title: string;
  content: string;
  size?: StickySize;
  status?: "not-started" | "in-progress" | "done" | "blocked";
  recursive: boolean;
  color: StickyNoteColor;
}

export type ConnectionStyle = {
  isCurved: boolean;
  isDirectional: boolean;
  type: "dependency" | "informs";
};

const DEFAULT_CONNECTION_STYLE: ConnectionStyle = {
  isCurved: true,
  isDirectional: false,
  type: "informs",
};

interface Connection {
  id: number;
  fromId: number;
  fromSide: Side;
  toId: number;
  toSide: Side;
  style: ConnectionStyle;
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
  updateNote: (newNote: Note) => void;
  deleteNote: (id: number) => void;

  // Connection Actions
  startConnection: (fromId: number, fromSide: Side) => void;
  endConnection: (toId: number, toSide: Side) => void;
  cancelConnection: () => void;
  deleteConnection: (connectionId: number) => void;
  updateConnection: (id: number, updates: Partial<Connection>) => void;

  // Settings actions
  changeSettings: (newSettings: BoardSettings) => void;

  // View Actions
  setZoom: (zoom: number) => void;
  clearBoard: () => void;

  // Persistence Actions
  saveBoard: () => void;
  loadBoard: () => void;
}

const savedState = localStorage.getItem("boardState");

const initState: BoardState = savedState ? JSON.parse(savedState) : undefined;

const useBoardStore = create<BoardState>((set, get) => ({
  // Initial State
  notes: initState ? initState.notes || [] : [],
  connections: initState ? initState.connections || [] : [],
  zoom: 1,
  activeConnection: null,
  settings: initState
    ? initState.settings || DEFAULT_SETTINGS
    : DEFAULT_SETTINGS,

  // Note Actions
  addNote: (x, y) => {
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: Date.now(),
          x,
          y,
          title: "",
          content: "",
          recursive: false,
          color: get().settings.defaultStickyColor,
        },
      ],
    }));
  },

  updateNote: (newNote) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === newNote.id ? { ...note, ...newNote } : note
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
            style: DEFAULT_CONNECTION_STYLE,
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
  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id
          ? {
              ...conn,
              ...updates,
              style: updates.style
                ? { ...conn.style, ...updates.style }
                : conn.style,
            }
          : conn
      ),
    })),

  changeSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
  // View Actions
  setZoom: (zoom) => set({ zoom }),
  clearBoard: () => {
    localStorage.removeItem("boardState");
    set(() => ({
      notes: [],
      connections: [],
      activeConnection: null,
    }));
  },

  // Persistence Actions
  saveBoard: () => {
    const state = get();
    const saveData = {
      id: Date.now(),
      notes: state.notes,
      connections: state.connections,
      settings: state.settings,
    };
    try {
      localStorage.setItem("boardState", JSON.stringify(saveData));
    } catch (err) {
      console.error("Failed to save board state:", err);
    }
  },
  loadBoard: () => {
    try {
      const savedState = localStorage.getItem("boardState");
      if (savedState) {
        const { notes, connections, settings } = JSON.parse(savedState);
        set({
          notes: notes || [],
          connections: connections || [],
          settings: settings || DEFAULT_SETTINGS,
        });
      }
    } catch (err) {
      console.error("Failed to load board state:", err);
    }
  },
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

export type { Note, Connection, Side, ActiveConnection, StickySize };
export default useBoardStore;
