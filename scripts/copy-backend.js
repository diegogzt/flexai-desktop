const fs = require('fs');
const path = require('path');

const sourceRoot = path.resolve(__dirname, '../..'); // flexai root
const destRoot = path.resolve(__dirname, '../resources/flexai-backend');

console.log(`Bundling FlexAI backend...`);
console.log(`Source: ${sourceRoot}`);
console.log(`Destination: ${destRoot}`);

// Ensure clean slate
if (fs.existsSync(destRoot)) {
  fs.rmSync(destRoot, { recursive: true, force: true });
}
fs.mkdirSync(destRoot, { recursive: true });

// 1. Copy packages
const packagesSrc = path.join(sourceRoot, 'packages');
const packagesDest = path.join(destRoot, 'packages');

console.log('Copying packages...');
fs.cpSync(packagesSrc, packagesDest, {
  recursive: true,
  filter: (src, dest) => {
    // Exclude src, test, and other dev files to save space
    // Keep dist, bin, package.json, and other necessary files
    if (src.includes('/src') || src.includes('/test') || src.includes('/__tests__')) {
      return false;
    }
    return true;
  }
});

// 2. Copy node_modules
// This is the heavy part. In a real production setup, we would prune devDependencies.
// For now, we copy everything to ensure it works.
const modulesSrc = path.join(sourceRoot, 'node_modules');
const modulesDest = path.join(destRoot, 'node_modules');

console.log('Copying node_modules (this may take a while)...');
fs.cpSync(modulesSrc, modulesDest, {
  recursive: true,
  dereference: true, // Follow symlinks to ensure we get the actual files
  filter: (src) => {
    // Exclude .bin to avoid symlink issues on some platforms
    if (src.includes('.bin')) return false;
    return true;
  }
});

console.log('FlexAI backend bundled successfully.');
