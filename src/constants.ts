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
