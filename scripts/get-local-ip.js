const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
const port = 3000;

console.log('\n📱 Mobile Access URLs:');
console.log(`   Local:   http://localhost:${port}`);
console.log(`   Network: http://${ip}:${port}`);
console.log('\n💡 To access from your phone:');
console.log(`   1. Make sure your phone is on the same WiFi network`);
console.log(`   2. Open your browser and go to: http://${ip}:${port}`);
console.log('\n');

