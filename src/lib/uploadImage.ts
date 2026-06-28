/**
 * uploadImage — single source of truth for getting an image from the user
 * into Firebase Storage and back as a download URL.
 *
 * Why this exists:
 *   Several places in the app previously called FileReader.readAsDataURL and
 *   wrote the resulting base64 string straight into a Firestore document.
 *   Firestore caps documents at ~1 MiB, so any moderately sized phone photo
 *   triggered a "value of property X is longer than 1048487 bytes" error
 *   server-side. This helper uploads bytes to Storage instead and returns
 *   only the URL, which is what the document should hold.
 *
 * What it does:
 *   1. Rejects non-images and oversized files (configurable; default 10 MB).
 *   2. Downscales large images on the client (canvas) so we don't waste
 *      Storage bandwidth on a 4000×3000 px hero just to render it at 800 px
 *      in a feed card. Skipped automatically for tiny images, SVGs, and GIFs
 *      (animated GIFs would lose animation if rasterised).
 *   3. Uploads to Storage at a predictable, per-user path.
 *   4. Returns the public download URL.
 *
 * Storage rules note:
 *   Your Storage security rules need to allow authenticated writes to
 *   `users/{uid}/uploads/...`. A reasonable default is:
 *     match /users/{userId}/{allPaths=**} {
 *       allow read: if true;
 *       allow write: if request.auth.uid == userId
 *                    && request.resource.size < 10 * 1024 * 1024
 *                    && request.resource.contentType.matches('image/.*');
 *     }
 */
import { ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { storage, auth } from "../firebase";

export type UploadFolder =
  | "posts"
  | "profile"
  | "covers"
  | "companies"
  | "events"
  | "groups"
  | "logos"
  | "misc";

export interface UploadOptions {
  /** Folder under users/{uid}/ — keeps Storage tidy and rules simple */
  folder?: UploadFolder;
  /** Max edge length for downscale, in pixels. Default 1600. */
  maxEdge?: number;
  /** JPEG quality 0–1 when re-encoding. Default 0.85. */
  quality?: number;
  /** Reject files larger than this many bytes. Default 10 MB. */
  maxBytes?: number;
}

const DEFAULTS: Required<UploadOptions> = {
  folder: "misc",
  maxEdge: 1600,
  quality: 0.85,
  maxBytes: 10 * 1024 * 1024,
};

/** Generate a unique, sortable, URL-safe filename suffix. */
function uniqueSuffix(ext: string) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}.${ext}`;
}

/** Read a File into an HTMLImageElement (for canvas rescaling). */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Downscale an image to fit within maxEdge × maxEdge while preserving aspect
 * ratio. Returns a Blob. If the image is already smaller, returns the
 * original file untouched.
 */
async function downscale(file: File, maxEdge: number, quality: number): Promise<Blob> {
  // Skip rasterising vectors and animated formats.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const img = await loadImageFromFile(file);
  const longest = Math.max(img.width, img.height);
  if (longest <= maxEdge) return file;

  const scale = maxEdge / longest;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  // Re-encode. PNGs stay PNG to preserve transparency; everything else → JPEG.
  const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      outType,
      outType === "image/jpeg" ? quality : undefined,
    );
  });
}

/** Pick a file extension from the upload's content type. */
function extFromType(type: string, fallback: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return fallback;
}

/**
 * Upload an image File and return its public download URL.
 *
 * Usage:
 *   const url = await uploadImage(file, { folder: "posts" });
 *   postData.image = url;            // store URL in Firestore, not bytes
 */
export async function uploadImage(file: File, opts: UploadOptions = {}): Promise<string> {
  const o = { ...DEFAULTS, ...opts };
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("You must be signed in to upload images.");
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > o.maxBytes) {
    throw new Error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${o.maxBytes / 1024 / 1024} MB.`);
  }

  // Downscale (may return original Blob if already small)
  let body: Blob = file;
  try {
    body = await downscale(file, o.maxEdge, o.quality);
  } catch {
    // If decoding fails (corrupt image, exotic format), upload as-is.
    body = file;
  }

  const ext = extFromType(body.type || file.type, "bin");
  const path = `users/${uid}/${o.folder}/${uniqueSuffix(ext)}`;
  const r = ref(storage, path);
  await uploadBytes(r, body, { contentType: body.type || file.type });
  return await getDownloadURL(r);
}

/**
 * Migrate a base64 data URL to Storage and return the new download URL.
 *
 * Use when you discover legacy data (e.g. a profile.photoURL that's actually
 * a giant base64 string) and want to fix it on the fly the next time the
 * user saves. Returns the input unchanged if it isn't a data URL.
 */
export async function migrateDataUrlToStorage(
  maybeDataUrl: string | null | undefined,
  folder: UploadFolder = "misc",
): Promise<string> {
  if (!maybeDataUrl || !maybeDataUrl.startsWith("data:")) return maybeDataUrl || "";
  const uid = auth.currentUser?.uid;
  if (!uid) return maybeDataUrl;
  // Parse content type from the data URL header
  const match = /^data:([^;]+);base64,/.exec(maybeDataUrl);
  const contentType = match?.[1] || "image/jpeg";
  const ext = extFromType(contentType, "jpg");
  const path = `users/${uid}/${folder}/${uniqueSuffix(ext)}`;
  const r = ref(storage, path);
  await uploadString(r, maybeDataUrl, "data_url");
  return await getDownloadURL(r);
}

/**
 * Check whether a string looks like an oversized inline image we should not
 * write to Firestore. Used as a guardrail before document writes.
 */
export function isInlineImage(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}
