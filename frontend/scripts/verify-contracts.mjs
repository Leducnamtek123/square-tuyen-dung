import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.resolve(__dirname, '../../api');
const scriptPath = path.join(apiDir, 'scripts/verify_api_contracts.py');

console.log('[CI] Running API Contract Verification against backend routes...');
try {
  const output = execSync(`python "${scriptPath}"`, {
    cwd: apiDir,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  console.log('\n[CI] API Contract Verification passed successfully.');
} catch (error) {
  console.error('\n[CI] API Contract Verification failed!');
  process.exit(1);
}
