import fs from 'fs';
import path from 'path';

try {
  // Clean and recreate dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist');
  fs.mkdirSync('dist/src');

  // Copy index.html
  fs.copyFileSync('index.html', 'dist/index.html');

  // Copy src folder files
  const srcDir = 'src';
  const destDir = 'dist/src';
  
  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
