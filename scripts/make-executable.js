import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const isWindows = process.platform === 'win32';
const buildPath = path.join(process.cwd(), 'build', 'index.js');

async function makeExecutable() {
  try {
    if (!isWindows) {
      // Unix systems: use chmod
      await fs.promises.chmod(buildPath, '755');
      console.log('Successfully made index.js executable using chmod');
    } else {
      // Windows: create a cmd wrapper
      const wrapperPath = path.join(path.dirname(buildPath), 'index.cmd');
      const nodeCmd = process.execPath.replace(/\\/g, '\\\\');
      const scriptPath = buildPath.replace(/\\/g, '\\\\');
      
      const wrapperContent = `@echo off\r\n"${nodeCmd}" "${scriptPath}" %*`;
      
      await fs.promises.writeFile(wrapperPath, wrapperContent);
      console.log('Successfully created Windows command wrapper');

      // Test the wrapper
      try {
        execSync(`"${wrapperPath}" --version`, { stdio: 'ignore' });
        console.log('Verified wrapper is executable');
      } catch (error) {
        console.warn('Warning: Could not verify wrapper execution:', error.message);
      }
    }
  } catch (error) {
    console.error('Error making file executable:', error);
    process.exit(1);
  }
}

makeExecutable().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});