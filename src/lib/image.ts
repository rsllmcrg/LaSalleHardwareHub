const PHOTO_SIZE = 240;
const PHOTO_QUALITY = 0.7;

// Photos are saved with the product data, so they are cropped small to fit in storage.
export async function resizePhoto(file: File): Promise<string> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("That file could not be read as a photo.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("That file could not be read as a photo.");

  const side = Math.min(bitmap.width, bitmap.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIZE,
    PHOTO_SIZE,
  );
  bitmap.close();
  return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
}
