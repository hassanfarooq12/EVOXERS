# 📱 Accessing Localhost on Your Phone

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Find your local IP address:**
   ```bash
   npm run ip
   ```
   Or check the Vite console output - it will show both URLs when the server starts.

3. **On your phone:**
   - Make sure your phone is connected to the **same WiFi network** as your computer
   - Open your phone's browser
   - Enter the network URL shown in the terminal (e.g., `http://192.168.1.100:3000`)

## Alternative: Get IP Manually

### Windows:
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### Mac/Linux:
```bash
ifconfig
```
Or:
```bash
ip addr show
```

## Troubleshooting

- **Can't connect?** Make sure both devices are on the same WiFi network
- **Firewall blocking?** You may need to allow Node.js through Windows Firewall
- **Port already in use?** Change the port in `vite.config.ts` if needed

The server is already configured to accept network connections! 🚀
