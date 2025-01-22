import { Connection, Note, StickySize } from "./BoardStore";

export interface StickyNoteColor {
  name: string;
  bgClass: string;
  rawColor: string;
}

export const STICKY_COLORS: StickyNoteColor[] = [
  { name: "Blue", bgClass: "bg-blue-100", rawColor: "#dbeafe" },
  { name: "Yellow", bgClass: "bg-yellow-100", rawColor: "#fef9c3" },
  { name: "Green", bgClass: "bg-green-100", rawColor: "#dcfce7" },
  { name: "Pink", bgClass: "bg-pink-100", rawColor: "#fce7f3" },
  { name: "Purple", bgClass: "bg-purple-100", rawColor: "#f3e8ff" },
];

export const BAD_ENDING_COLOR: StickyNoteColor = {
  name: "red",
  bgClass: "bg-red-200",
  rawColor: "#ff0000",
};

export const BAD_ENDING: Note[] = [
  {
    id: 666,
    x: 256,
    y: 256,
    recursive: false,
    color: BAD_ENDING_COLOR,
    title: "Perhaps you misunderstand",
    content: {
      summary:
        "The only way to make stickies is by splitting them. Split this one to make more.",
    },
    status: "not-started",
  },
];

export const DEFAULT_NOTES: Note[] = [
  {
    id: 1,
    title: "Welcome to Tech-Tree",
    content: {
      summary: "To start, simply use the tool. To stop, do the opposite.",
    },
    x: 256,
    y: 256,
    recursive: false,
    color: STICKY_COLORS[0],
    status: "not-started",
  },
  {
    id: 2,
    title: "Everything Comes From Something",
    content: {
      summary:
        "To make a new sticky, start with a connector. \nOr, split an existing one from the hover menu.",
    },
    x: 922,
    y: 512,
    recursive: false,
    color: STICKY_COLORS[0],
    status: "not-started",
  },
  {
    id: 3,
    title: "Agility",
    content: {
      summary:
        "This tool can help you run a standard agile workflow. See the size in the bottom right corner \n                                        ⌄",
    },
    x: 220,
    y: 601,
    recursive: false,
    color: STICKY_COLORS[1],
    size: "medium",
    status: "not-started",
  },
  {
    id: 4,
    title: "Never Stop Moving",
    content: {
      summary:
        "You can navigate with the arrow keys. To zoom in or out, hold ctrl and either scroll or use the +/- keys.",
    },
    x: 512,
    y: 672,
    recursive: false,
    color: STICKY_COLORS[2],
    status: "not-started",
  },
  // {
  //   id: 4,
  //   title: "Thank the Maker!",
  //   content: "This tool is made and maintained by James Graham. Find him",
  //   x: 1024,
  //   y: 256,
  //   recursive: false,
  //   color: STICKY_COLORS[4],
  // },
];

export const DEFAULT_CONNECTIONS: Connection[] = [
  {
    fromId: 4,
    toId: 2,
    fromSide: "right",
    toSide: "left",
    style: {
      isCurved: true,
      type: "dependency",
    },
    id: 1,
  },
  {
    fromId: 1,
    toId: 3,
    fromSide: "bottom",
    toSide: "top",
    style: {
      isCurved: true,
      type: "informs",
    },
    id: 2,
  },
  {
    fromId: 1,
    toId: 4,
    fromSide: "bottom",
    toSide: "top",
    style: {
      isCurved: true,
      type: "informs",
    },
    id: 3,
  },
];

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

export const AUTOSAVE_MILLIS = 30000; // 30s
