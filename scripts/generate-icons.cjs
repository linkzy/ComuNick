const sharp = require("sharp");
const path = require("path");

const SIZES = [192, 512];
const OUT_DIR = path.join(__dirname, "..", "public", "icons");

function svg(size) {
  const r = Math.round(size * 0.18);
  const fs = Math.round(size * 0.5);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3498db"/>
      <stop offset="100%" stop-color="#2c3e50"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <text x="${size/2}" y="${Math.round(size*0.56)}"
        font-family="system-ui, -apple-system, sans-serif"
        font-size="${fs}"
        font-weight="800"
        fill="white"
        text-anchor="middle">CN</text>
</svg>`;
}

async function main() {
  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(outPath);
    console.log(`Generated ${outPath} (${size}x${size})`);
  }
}

main().catch(console.error);
