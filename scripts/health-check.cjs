const net = require('net');

const PORTS = [5174, 5000];
const TIMEOUT = 30000; // 30 seconds max wait
const CHECK_INTERVAL = 500; // check every 500ms

const startTime = Date.now();

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(200);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, '127.0.0.1');
  });
}

async function run() {
  while (true) {
    if (Date.now() - startTime > TIMEOUT) {
      console.log('\x1b[33m⚠️ Startup health check timed out waiting for ports to open.\x1b[0m');
      process.exit(0);
    }
    
    const statuses = await Promise.all(PORTS.map(checkPort));
    if (statuses.every(Boolean)) {
      console.log('\n\x1b[32m================================================================');
      console.log('🚀 ShambaPoint Dev Environment is Ready!');
      console.log('✅ Frontend: http://localhost:5174');
      console.log('✅ Backend:  http://localhost:5000/api');
      console.log('================================================================\x1b[0m\n');
      process.exit(0);
    }
    
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }
}

run();
