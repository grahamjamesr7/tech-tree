import { create } from "zustand";
import {
  BAD_ENDING,
  DEFAULT_CONNECTIONS,
  DEFAULT_NOTES,
  STICKY_COLORS,
  StickyNoteColor,
} from "./constants";

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

export const STICKY_STATUSES = {
  notStarted: "not-started",
  inProgress: "in-progress",
  done: "done",
  blocked: "blocked",
} as const;

export type StickyStatus =
  (typeof STICKY_STATUSES)[keyof typeof STICKY_STATUSES];

export type EditMode = "add" | "arrange" | "execute";

interface StickyContent {
  context?: string;
  objective?: string;
  acceptanceCriteria?: string;
  summary?: string;
}

interface Note {
  id: number;
  x: number;
  y: number;
  title: string;
  content: StickyContent;
  size?: StickySize;
  status: StickyStatus;
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
  createNewOnCanvasClick: boolean;
  enableAutoSave: boolean;
  lastSaveTime: number;
}

export interface Point {
  x: number;
  y: number;
}

const DEFAULT_SETTINGS: BoardSettings = {
  confirmDeletes: true,
  defaultStickyColor: STICKY_COLORS[0],
  showGrid: true,
  showPoints: true,
  createNewOnCanvasClick: true,
  enableAutoSave: true,
  lastSaveTime: Date.now(),
};

interface BoardState {
  // State
  notes: Note[];
  connections: Connection[];
  zoom: number;
  activeConnection: ActiveConnection | null;
  settings: BoardSettings;
  manifestoOpen: boolean;
  currentPan: Point;
  editMode: EditMode;
  isEditing: boolean;
  selectedConnection?: number;

  // global UI actions
  openManifesto: () => void;
  closeManifesto: () => void;
  changeMode: (newMode: EditMode) => void;
  changeIsEditing: (newEditing: boolean) => void;

  // Note Actions
  addNote: (x: number, y: number) => number;
  updateNote: (newNote: Partial<Note> & { id: number }) => void;
  deleteNote: (id: number) => void;
  splitNote: (noteId: number) => void;

  // Connection Actions
  startConnection: (fromId: number, fromSide: Side) => void;
  endConnection: (toId: number, toSide: Side) => void;
  cancelConnection: () => void;
  deleteConnection: (connectionId: number) => void;
  updateConnection: (id: number, updates: Partial<Connection>) => void;
  changeSelectedConnection: (id: number | undefined) => void;

  // Settings actions
  changeSettings: (newSettings: Partial<BoardSettings>) => void;

  // View Actions
  setZoom: (zoom: number) => void;
  clearBoard: () => void;

  // Movement actions
  setPan: (newPan: Point) => void;

  // Persistence Actions
  saveBoard: () => number | undefined;
  loadBoard: () => void;
}

const savedState = localStorage.getItem("boardState");
const savedSettings = localStorage.getItem("tech-tree-settings");

function getSavedState():
  | { notes: Note[]; connections: Connection[] }
  | undefined {
  console.debug("loading");
  const savedState = localStorage.getItem("boardState");
  if (!savedState) return undefined;

  const { notes, connections } = JSON.parse(savedState);
  for (const note of notes) {
    if (note.color === undefined) {
      note.color = STICKY_COLORS[0];
    }
    if (note.status === undefined) {
      note.status = STICKY_STATUSES.notStarted;
      console.debug("patching status", note.id, note.status);
    }
  }
  return { notes, connections };
}

// @ts-ignore
const initState: BoardState | undefined = getSavedState();

const initSettings: BoardSettings = savedSettings
  ? JSON.parse(savedSettings)
  : DEFAULT_SETTINGS;

const useBoardStore = create<BoardState>((set, get) => ({
  // Initial State
  notes: initState ? initState.notes || DEFAULT_NOTES : DEFAULT_NOTES,
  connections: initState
    ? initState.connections || DEFAULT_CONNECTIONS
    : DEFAULT_CONNECTIONS,
  zoom: 1,
  activeConnection: null,
  settings: initSettings,
  manifestoOpen: false,
  currentPan: { x: 0, y: 0 },
  editMode: "add",
  isEditing: false,
  selectedConnection: undefined,

  openManifesto: () => set((state) => ({ ...state, manifestoOpen: true })),
  closeManifesto: () => set((state) => ({ ...state, manifestoOpen: false })),
  changeIsEditing: (newEditing) =>
    set((state) => ({ ...state, isEditing: newEditing })),

  // Mode Actions
  changeMode: (newMode) => set((state) => ({ ...state, editMode: newMode })),

  // Note Actions
  addNote: (x, y) => {
    const newId = Date.now();
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id: newId,
          x,
          y,
          title: "",
          content: {},
          recursive: false,
          color: get().settings.defaultStickyColor,
          status: "not-started",
        },
      ],
    }));
    return newId;
  },

  updateNote: (newNote) => {
    console.debug("Updating note", { newNote });
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === newNote.id ? { ...note, ...newNote } : note
      ),
    }));
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      connections: state.connections.filter(
        (conn) => conn.fromId !== id && conn.toId !== id
      ),
    }));
    const notes = get().notes;

    if (notes.length === 0) {
      setTimeout(() => {
        set((state) => ({
          notes: BAD_ENDING,
        }));
      }, 3200);
    }
  },

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
      title: noteId === 666 ? "There you go!" : "",
      content: {
        summary:
          noteId === 666
            ? "Why the restriction? Check the manifesto."
            : undefined,
      },
      recursive: false,
      status: "not-started",
      color:
        noteId === 666 ? get().settings.defaultStickyColor : sourceNote.color, // Inherit color from source note
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
  changeSelectedConnection: (id) => {
    set((state) => ({
      selectedConnection: id,
    }));
  },

  changeSettings: (newSettings: Partial<BoardSettings>) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      // Save settings to localStorage
      try {
        localStorage.setItem(
          "tech-tree-settings",
          JSON.stringify(updatedSettings)
        );
      } catch (err) {
        console.error("Failed to save settings:", err);
      }
      return { settings: updatedSettings };
    });
  },
  // View Actions
  setZoom: (zoom) => set({ zoom }),
  clearBoard: () => {
    localStorage.removeItem("boardState");
    set(() => ({
      notes: DEFAULT_NOTES.slice(0, 1),
      connections: [],
      activeConnection: null,
    }));
  },

  // Movement Actions
  setPan(newPan) {
    set({ currentPan: newPan });
  },

  // Persistence Actions
  saveBoard: () => {
    const state = get();
    const saveTime = Date.now();
    const saveData = {
      id: saveTime,
      notes: state.notes,
      connections: state.connections,
    };
    try {
      localStorage.setItem("boardState", JSON.stringify(saveData));
      set({ settings: { ...state.settings, lastSaveTime: saveTime } });
      if (localStorage.getItem("tech-tree-settings") === undefined) {
        localStorage.setItem(
          "tech-tree-settings",
          JSON.stringify(state.settings)
        );
      }
    } catch (err) {
      console.error("Failed to save board state:", err);
      return undefined;
    }
    return saveTime;
  },
  loadBoard: () => {
    try {
      const savedState = getSavedState();
      set({
        notes: savedState ? savedState.notes : [],
        connections: savedState ? savedState.connections : [],
      });
    } catch (err) {
      console.error("Failed to load board state:", err);
    }
  },
}));

export type { Note, Connection, Side, ActiveConnection };
export default useBoardStore;
