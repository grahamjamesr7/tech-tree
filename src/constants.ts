import { Note, StickySize } from "./BoardStore";

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
