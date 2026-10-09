# Quick Fix: Network Error on Registration

## The Problem
You're seeing "Network error" because the app is trying to connect to `localhost:8000`, which doesn't work on mobile devices or simulators.

## The Solution (2 minutes)

### Step 1: Find Your IP Address

**On macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for an IP like `192.168.1.xxx` or `10.0.0.xxx`

**Or use:**
```bash
ipconfig getifaddr en0
```

### Step 2: Create `.env` File

Create a file named `.env` in the project root (same folder as `package.json`) with:

```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8000/api
```

**Example** (replace with your actual IP):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### Step 3: Restart Expo

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### Step 4: Verify

When you start the app, check the console/logs. You should see:
```
🌐 API Base URL: http://192.168.1.100:8000/api
```

## Important Notes

- ✅ `.env` file is already in `.gitignore` (won't be committed)
- ✅ Works on iOS Simulator, Android Emulator, and physical devices
- ⚠️ Make sure your backend server is running on port 8000
- ⚠️ Make sure your device and computer are on the same WiFi network

## Still Having Issues?

1. **Check backend is running:**
   ```bash
   curl http://YOUR_IP:8000/api/health
   ```

2. **Check firewall:** Make sure port 8000 is not blocked

3. **Check the console:** Look for the API URL log message to verify it's using the right address
