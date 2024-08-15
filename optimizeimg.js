const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'frontend/public/img';
const outputDir = 'frontend/public/img-optimized';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { width: 640, suffix: 'small' },
  { width: 1024, suffix: 'medium' },
  { width: 1920, suffix: 'large' }
];

fs.readdirSync(inputDir).forEach(file => {
  const inputPath = path.join(inputDir, file);
  
  sizes.forEach(({ width, suffix }) => {
    const outputPath = path.join(outputDir, `${file.replace(/\.[^/.]+$/, "")}_${suffix}.webp`);

    sharp(inputPath)
      .resize(width)
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => console.log(`Optimized: ${file} at ${width}px`))
      .catch(err => console.error(`Error optimizing ${file} at ${width}px:`, err));
  });
});