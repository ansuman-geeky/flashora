const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Postinstall] Running NativeWind tailwind pre-compilation...');

try {
  const cacheDir = path.resolve('node_modules', '.cache', 'nativewind');
  fs.mkdirSync(cacheDir, { recursive: true });

  const inputCss = path.resolve('global.css');
  const outputCss = path.resolve(cacheDir, 'global.css');

  console.log(`[Postinstall] Compiling Tailwind CSS from ${inputCss} to ${outputCss}...`);
  execSync(`npx tailwindcss -i "${inputCss}" -o "${outputCss}"`, { stdio: 'inherit' });

  // Generate the native extension file so Metro resolves it for native
  const nativeCss = `${outputCss}.native.css`;
  fs.copyFileSync(outputCss, nativeCss);
  console.log(`[Postinstall] Successfully generated native CSS cache at ${nativeCss}`);

  // Generate the web extension file so Metro resolves it for web
  const webCss = `${outputCss}.web.css`;
  fs.copyFileSync(outputCss, webCss);
  console.log(`[Postinstall] Successfully generated web CSS cache at ${webCss}`);

  console.log('[Postinstall] NativeWind pre-compilation complete!');
} catch (error) {
  console.error('[Postinstall] Failed to pre-compile Tailwind CSS:', error.message);
}
