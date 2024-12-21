// src/store/boardStore.ts
import { create } from "zustand";
import { STICKY_COLORS, StickyNoteColor } from "./constants";

type Side = "top" | "right" | "bottom" | "left";

export const STICKY_SIZES = {
  trivial: "trivial",
  extraSmall: "extra-small",
  small: "small",
  medium: "medium",
  large: "large",
  extraLarge: "extra-large",
  tooBig: "too-big",
} as const;

export type StickySize = (typeof STICKY_SIZES)[keyof typeof STICKY_SIZES];

export const STICKY_SIZE_COPY_MAP: Record<StickySize, string> = {
  trivial: "XXS",
  "extra-small": "XS",
  small: "S",
  medium: "M",
  large: "L",
  "extra-large": "XL",
  "too-big": "XXL",
};

export const STICKY_SIZE_NUMERIC_MAP: Record<StickySize, number> = {
  trivial: 1,
  "extra-small": 2,
  small: 3,
  medium: 5,
  large: 8,
  "extra-large": 13,
  "too-big": 21,
};

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
  type: "dependency" | "informs";
};

const DEFAULT_CONNECTION_STYLE: ConnectionStyle = {
  isCurved: true,
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
  showGrid: boolean;
  showPoints: boolean;
}

const DEFAULT_SETTINGS: BoardSettings = {
  confirmDeletes: true,
  defaultStickyColor: STICKY_COLORS[0],
  showGrid: false,
  showPoints: true,
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
  updateNote: (newNote: Partial<Note> & { id: number }) => void;
  deleteNote: (id: number) => void;
  splitNote: (noteId: number) => void;

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
const savedSettings = localStorage.getItem("tech-tree-settings");

const initState: BoardState = savedState ? JSON.parse(savedState) : undefined;

const initSettings: BoardSettings = savedSettings
  ? JSON.parse(savedSettings)
  : DEFAULT_SETTINGS;

const useBoardStore = create<BoardState>((set, get) => ({
  // Initial State
  notes: initState ? initState.notes || [] : [],
  connections: initState ? initState.connections || [] : [],
  zoom: 1,
  activeConnection: null,
  settings: initSettings,

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

  updateNote: (newNote) => {
    console.debug("Updating note", { newNote });
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === newNote.id ? { ...note, ...newNote } : note
      ),
    }));
  },

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      connections: state.connections.filter(
        (conn) => conn.fromId !== id && conn.toId !== id
      ),
    })),

  splitNote: (noteId: number) => {
    const sourceNote = get().notes.find((note) => note.id === noteId);
    if (!sourceNote) return;

    // Calculate new note position (1.5x height = 144 units down)
    const newX = sourceNote.x;
    const newY = sourceNote.y + 256;

    // Create new note
    const newNoteId = Date.now();
    const newNote: Note = {
      id: newNoteId,
      x: newX,
      y: newY,
      title: "",
      content: "",
      recursive: false,
      color: sourceNote.color, // Inherit color from source note
    };

    // Create connection configuration
    const newConnection: Connection = {
      id: Date.now() + 1, // Ensure unique ID
      fromId: sourceNote.id,
      fromSide: "bottom",
      toId: newNoteId,
      toSide: "top",
      style: DEFAULT_CONNECTION_STYLE,
    };

    // Update state with new note and connection
    set((state) => ({
      notes: [...state.notes, newNote],
      connections: [...state.connections, newConnection],
    }));

    return newNoteId; // Optionally return the new note's ID for further operations
  },

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
    set((state) => {
      const newState = {
        settings: { ...state.settings, ...newSettings },
      };
      // Save settings to localStorage
      try {
        localStorage.setItem(
          "tech-tree-settings",
          JSON.stringify(newState.settings)
        );
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return newState;
    });
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
        const { notes, connections } = JSON.parse(savedState);
        set({
          notes: notes || [],
          connections: connections || [],
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

export type { Note, Connection, Side, ActiveConnection };
export default useBoardStore;
