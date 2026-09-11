// Local-only memory store (static hosting has no backend).
// Entries live in the visitor's own browser via localStorage.

export interface LocalMemory {
  id: string;
  name: string;
  text: string;
  photoUrl?: string; // downscaled JPEG data URL
  createdAt: string;
}

const KEY = "buwa:memories";
const MAX = 20;

export function loadLocalMemories(): LocalMemory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as LocalMemory[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveLocalMemory(m: LocalMemory): void {
  const all = [m, ...loadLocalMemories()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

/** Downscale an uploaded photo so it fits localStorage (max 1000px, JPEG). */
export function downscalePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return Promise.reject(new Error("Photo must be JPEG/PNG/WebP."));
  }
  if (file.size > 5 * 1024 * 1024) {
    return Promise.reject(new Error("Photo must be under 5MB."));
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Couldn't read that photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that photo."));
    };
    img.src = url;
  });
}
