import { RGBColor } from '../types/dental';

// Read only original pixels; clip the ROI to the image, and ignore transparent pixels.
export function sampleRegion(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): RGBColor | null {
  if (x < 0 || y < 0 || x >= ctx.canvas.width || y >= ctx.canvas.height) return null;
  const left = Math.max(0, Math.floor(x) - Math.floor(size / 2));
  const top = Math.max(0, Math.floor(y) - Math.floor(size / 2));
  const width = Math.min(size, ctx.canvas.width - left);
  const height = Math.min(size, ctx.canvas.height - top);
  const data = ctx.getImageData(left, top, width, height).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] !== 255) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
  }
  if (!count) return null;
  r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
  return { r, g, b, hex: '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') };
}
