const { execSync, spawnSync } = require('child_process');

const PORTS = [5174, 5000];

function getListeningPids(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.split(/\r?\n/);
      const pids = new Set();

      for (const line of lines) {
        if (!line.includes(`:${port}`) || !line.includes('LISTENING')) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== '0') {
          pids.add(parseInt(pid, 10));
        }
      }

      return Array.from(pids);
    } catch (err) {
      if (err.status === 1) return [];
      throw err;
    }
  }

  try {
    const output = execSync(`lsof -t -i :${port}`, { encoding: 'utf8' }).trim();
    return output ? output.split(/\r?\n/).filter(Boolean) : [];
  } catch (err) {
    return [];
  }
}

function killPort(port) {
  if (process.platform === 'win32') {
    try {
      const initialPids = getListeningPids(port);
      if (!initialPids.length) {
        console.log(`No processes found listening on port ${port}.`);
        return;
      }

      console.log(`Found processes listening on port ${port}: ${initialPids.join(', ')}`);

      for (const pid of initialPids) {
        const currentPids = getListeningPids(port);
        if (!currentPids.includes(pid)) {
          continue;
        }

        console.log(`Killing process ${pid}...`);
        const result = spawnSync('taskkill', ['/F', '/PID', String(pid)], { encoding: 'utf8' });
        const output = `${result.stdout || ''}${result.stderr || ''}`.trim();

        if (result.status === 0) {
          continue;
        }

        if (output.includes('not found')) {
          continue;
        }

        console.warn(`Unable to kill process ${pid}: ${output}`);
      }
    } catch (err) {
      console.error(`Error checking/killing processes on port ${port}:`, err.message);
    }
  } else {
    // Unix fallback
    try {
      const output = execSync(`lsof -t -i :${port}`, { encoding: 'utf8' }).trim();
      if (output) {
        const pids = output.split(/\r?\n/).filter(Boolean);
        console.log(`Found processes listening on port ${port}: ${pids.join(', ')}`);
        for (const pid of pids) {
          try {
            console.log(`Killing process ${pid}...`);
            execSync(`kill -9 ${pid}`);
          } catch (e) {
            console.warn(`Failed to kill process ${pid}: ${e.message}`);
          }
        }
      } else {
        console.log(`No processes found listening on port ${port}.`);
      }
    } catch (err) {
      console.log(`No processes found listening on port ${port}.`);
    }
  }
}

console.log('🧹 Cleaning up stale processes on development ports...');
PORTS.forEach(killPort);
console.log('✨ Clean up finished!\n');
