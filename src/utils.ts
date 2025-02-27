import { Note, Side } from "./BoardStore";

/**
 * Adjusts a hex color by a given percentage
 * @param hex The hex color to adjust (e.g., "#dbeafe")
 * @param amount The amount to adjust by (-1 to 1, negative darkens, positive lightens)
 * @returns An adjusted hex color
 */
export function adjustHexColor(hex: string, amount: number = 0.1): string {
  // Remove the hash if it exists
  hex = hex.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust each channel
  const adjustChannel = (channel: number) =>
    Math.min(255, Math.max(0, Math.floor(channel * (1 + amount))));

  // Convert back to hex
  const newR = adjustChannel(r).toString(16).padStart(2, "0");
  const newG = adjustChannel(g).toString(16).padStart(2, "0");
  const newB = adjustChannel(b).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}

export function getOppositeSide(side: Side): Side {
  switch (side) {
    case "bottom":
      return "top";
    case "top":
      return "bottom";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

// Helper function to get connection point coordinates
export const getConnectionPoint = (
  note: Note,
  side: Side
): { x: number; y: number } => {
  switch (side) {
    case "top":
      return { x: note.x, y: note.y - 112 };  // h-56/2 = 224/2
    case "right":
      return { x: note.x + 132, y: note.y };  // w-64/2 + 4 = 256/2 + 4 for border
    case "bottom":
      return { x: note.x, y: note.y + 112 };  // h-56/2 = 224/2
    case "left":
      return { x: note.x - 132, y: note.y };  // w-64/2 + 4 = 256/2 + 4 for border
  }
};
