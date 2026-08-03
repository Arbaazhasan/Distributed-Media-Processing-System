import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const services = [
  { name: 'GATEWAY', dir: 'api-gateway', cmd: npmCmd, args: ['run', 'dev'] },
  { name: 'WORKER', dir: 'worker-node', cmd: npmCmd, args: ['run', 'dev'] },
  { name: 'SIGNALING', dir: 'signaling-server', cmd: npmCmd, args: ['run', 'dev'] },
  { name: 'CLIENT', dir: 'client', cmd: npmCmd, args: ['run', 'dev'] },
];

console.log('[Runner] Starting all distributed services on Windows platform...');

services.forEach((service) => {
  const child = spawn(service.cmd, service.args, {
    cwd: path.join(rootDir, service.dir),
    shell: true,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`[${service.name}] Error:`, err);
  });

  child.on('exit', (code) => {
    console.log(`[${service.name}] Exited with code ${code}`);
  });
});
