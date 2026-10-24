# Comprehensive Guide: Hosting a Distribution Website for DockMon on a VPS

> **Target Audience**: Developers, DevOps Engineers, and AI Agents/LLMs taking on the task of building, deploying, and maintaining the official product landing page and binary distribution website for **DockMon**.
> **Author & Brand**: [Zephyrus Labs](https://zephyrus-labs.tech/) &bull; Lead Developer: [Shubham Sharma](https://github.com/uchiha-fire)
> **License**: MIT License

---

## 1. Executive Summary & Objective

### 1.1 The Goal
Create and host a modern, high-converting product landing page on a self-hosted Linux VPS under the custom domain **`https://dockmon.zephyrus-labs.tech`**.

The website must:
1. Showcase the features, screenshots, and capabilities of **DockMon**.
2. Automatically detect the visitor's operating system (Windows vs. Linux distros) and present a prominent, primary **"Download for [OS]"** button.
3. Provide a clean dropdown or table of alternative downloads for all supported package formats (`.AppImage`, `.deb`, `.rpm`, `.exe` installer, `.exe` portable).
4. Serve the binaries directly from the VPS (or seamlessly stream/redirect from GitHub Releases).
5. Run securely with automated HTTPS (TLS) using Caddy or Nginx with Docker Compose.

---

## 2. Binary Specifications & Package Matrix

The application is an Electron desktop app built using Vite, React, TypeScript, and SSH2.

| Target OS | Package Type | Filename Pattern | Typical Size | MIME Type | Recommended Download Command / Direct URL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Linux (Universal)** | AppImage | `dockmon-1.0.0.AppImage` | ~108 MB | `application/x-executable` | `chmod +x <file> && ./<file>` |
| **Linux (Debian/Ubuntu)** | DEB Package | `dockmon_1.0.0_amd64.deb` | ~84 MB | `application/vnd.debian.binary-package` | `sudo apt install ./<file>` |
| **Linux (Fedora/RHEL)** | RPM Package | `dockmon-1.0.0.x86_64.rpm`| ~85 MB | `application/x-rpm` | `sudo dnf install ./<file>` |
| **Windows 10/11** | NSIS Installer | `DockMon-Setup-1.0.0.exe` | ~85 MB | `application/vnd.microsoft.portable-executable` | Double click to install |
| **Windows 10/11** | Portable Standalone | `DockMon-1.0.0-portable.exe` | ~80 MB | `application/vnd.microsoft.portable-executable` | Run directly without install |
| **macOS (Optional)** | DMG / Zip | `DockMon-1.0.0.dmg` | ~90 MB | `application/x-apple-diskimage` | Open DMG & drag to Applications |

---

## 3. Architecture & Hosting Patterns

Any LLM or developer building this website can choose between two architectures depending on VPS bandwidth and performance requirements:

### Architecture Pattern A: Direct Self-Hosted VPS Storage (Zero External Dependencies)
- **Mechanism**: The website and the binary files live on the same VPS filesystem (e.g. `/var/www/downloads/`).
- **Web Server**: Caddy or Nginx serves both static HTML/CSS/JS and the downloadable binary files.
- **Pros**: 100% self-hosted, no third-party branding or rate limits, works entirely inside private or air-gapped networks.
- **Cons**: Download traffic consumes VPS outbound bandwidth.

### Architecture Pattern B: Smart Hybrid (VPS Landing Page + GitHub Releases CDN)
- **Mechanism**: The high-converting landing page is hosted on the VPS. When the user clicks "Download", the server or frontend links directly to GitHub Releases assets (`https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/...`).
- **Pros**: Fast downloads worldwide via GitHub's Global CDN (Fastly/Azure), zero VPS bandwidth cost for multi-gigabyte downloads.
- **Cons**: Requires files to be published on GitHub Releases.

> **Recommendation**: Implement **Pattern A** with files on the VPS, or support a simple environment toggle (`DOWNLOAD_SOURCE=local|github`).

---

## 4. Frontend Landing Page Implementation

### 4.1 Client-Side OS Auto-Detection Script
Place this script in the landing page frontend. It detects whether the user is browsing from Windows, Linux, macOS, or Mobile, and automatically updates the primary Call to Action (CTA) button:

```javascript
// os-detector.js
function detectClientOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  // Modern Client Hints API if available
  if (navigator.userAgentData?.platform) {
    const hintPlatform = navigator.userAgentData.platform.toLowerCase();
    if (hintPlatform.includes('win')) return 'windows';
    if (hintPlatform.includes('mac')) return 'mac';
    if (hintPlatform.includes('linux')) return 'linux';
  }

  // Fallback to User-Agent parsing
  if (ua.includes('win') || platform.includes('win')) return 'windows';
  if (ua.includes('mac') || platform.includes('mac')) return 'mac';
  if (ua.includes('linux') || platform.includes('linux')) return 'linux';
  if (/android|iphone|ipad|ipod/.test(ua)) return 'mobile';

  return 'unknown';
}

const RELEASE_BASE_URL = '/downloads'; // or 'https://github.com/uchiha-fire/vps-monitoring-tool/releases/latest/download'
const VERSION = '1.0.0';

const DOWNLOAD_LINKS = {
  windows: {
    label: 'Download for Windows',
    sublabel: 'Installer (.exe) &bull; 64-bit',
    filename: `DockMon-Setup-${VERSION}.exe`,
    url: `${RELEASE_BASE_URL}/DockMon-Setup-${VERSION}.exe`
  },
  linux: {
    label: 'Download for Linux',
    sublabel: 'Universal AppImage &bull; x86_64',
    filename: `dockmon-${VERSION}.AppImage`,
    url: `${RELEASE_BASE_URL}/dockmon-${VERSION}.AppImage`
  },
  mac: {
    label: 'Download for macOS',
    sublabel: 'Universal (.dmg)',
    filename: `DockMon-${VERSION}.dmg`,
    url: `${RELEASE_BASE_URL}/DockMon-${VERSION}.dmg`
  }
};

function setupDownloadButtons() {
  const os = detectClientOS();
  const primaryBtn = document.getElementById('primary-download-btn');
  const primaryLabel = document.getElementById('primary-download-label');
  const primarySub = document.getElementById('primary-download-sub');

  const config = DOWNLOAD_LINKS[os] || DOWNLOAD_LINKS.linux;

  if (primaryBtn && primaryLabel) {
    primaryBtn.href = config.url;
    primaryBtn.setAttribute('download', config.filename);
    primaryLabel.innerHTML = config.label;
    if (primarySub) primarySub.innerHTML = config.sublabel;
  }
}

document.addEventListener('DOMContentLoaded', setupDownloadButtons);
```

---

### 4.2 Single-File Landing Page Template (`index.html`)

Here is a modern, responsive, high-converting landing page using Tailwind CSS (via CDN) and Lucide icons:

```html
<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VPS Docker Monitor - Native Desktop Management for Remote Containers</title>
  <meta name="description" content="Agentless, high-performance desktop application to monitor remote Linux VPS Docker containers and Compose stacks over pure SSH. Built by Zephyrus Labs.">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#eef2ff',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen selection:bg-indigo-500 selection:text-white">

  <!-- Navbar -->
  <header class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect width="18" height="18" x="3" y="3" rx="2" stroke-width="2"/>
            <path stroke-width="2" d="M7 8h10M7 12h10M7 16h6"/>
          </svg>
        </div>
        <div>
          <span class="font-bold text-lg tracking-tight">VPS Docker Monitor</span>
          <span class="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">v1.0.0</span>
        </div>
      </div>
      <div class="flex items-center space-x-6 text-sm">
        <a href="#features" class="text-slate-400 hover:text-white transition">Features</a>
        <a href="#downloads" class="text-slate-400 hover:text-white transition">Downloads</a>
        <a href="https://github.com/uchiha-fire/vps-monitoring-tool" target="_blank" class="text-slate-400 hover:text-white transition flex items-center gap-1.5">
          GitHub
        </a>
        <a href="#downloads" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition">
          Get Started
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-24 pb-20 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>
    <div class="max-w-5xl mx-auto px-6 text-center relative z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-medium mb-8">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Zero Server Agents Required &bull; Pure SSH Port 22
      </div>
      <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6">
        Manage Remote VPS Docker Stacks <br class="hidden sm:inline">
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">Without Opening Ports or Installing Daemons</span>
      </h1>
      <p class="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
        Connect securely via SSH. Automatically discover Docker Compose stacks, stream ANSI-colored container logs in real time, and restart services with a single click.
      </p>

      <!-- Dynamic Download CTA -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <a id="primary-download-btn" href="/downloads/VPS-Docker-Monitor-1.0.0.AppImage" download
           class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-base shadow-xl shadow-indigo-600/25 flex flex-col items-center justify-center transition group">
          <span id="primary-download-label" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download for Linux
          </span>
          <span id="primary-download-sub" class="text-xs text-indigo-200 font-normal mt-0.5">Universal AppImage &bull; 64-bit</span>
        </a>

        <a href="#downloads" class="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white font-medium text-sm transition flex items-center justify-center gap-2">
          Other Platforms (.deb, .rpm, .exe)
        </a>
      </div>
      <p class="text-xs text-slate-500">Free & Open Source under MIT License &bull; Built by <a href="https://zephyrus-labs.tech/" class="text-slate-400 hover:underline">Zephyrus Labs</a></p>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="py-20 border-t border-slate-800/60 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold tracking-tight">Everything You Need to Control Remote Servers</h2>
        <p class="text-slate-400 text-sm mt-3">Engineered for sysadmins, homelabbers, and software developers.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 class="text-lg font-bold mb-2">Agentless SSH Connectivity</h3>
          <p class="text-sm text-slate-400 leading-relaxed">No Portainer agent, no exposed Docker socket over HTTP. Executes standard Docker CLI commands over encrypted SSH port 22.</p>
        </div>

        <!-- Feature 2 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h3 class="text-lg font-bold mb-2">Compose Stack Hierarchy</h3>
          <p class="text-sm text-slate-400 leading-relaxed">Containers are grouped by their Compose project labels. Restart an entire microservice stack or control standalone containers individually.</p>
        </div>

        <!-- Feature 3 -->
        <div class="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="text-lg font-bold mb-2">Real-Time xterm.js Log Viewer</h3>
          <p class="text-sm text-slate-400 leading-relaxed">Integrated hardware-accelerated terminal with ANSI colors, regex search, buffer size controls, and auto-scrolling tail follow.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- All Downloads Section -->
  <section id="downloads" class="py-20 border-t border-slate-800/60">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight">Download for Your Platform</h2>
        <p class="text-slate-400 text-sm mt-2">Available for all major Linux distributions and 64-bit Windows.</p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Operating System</th>
              <th class="px-6 py-4">Format</th>
              <th class="px-6 py-4">Instructions</th>
              <th class="px-6 py-4 text-right">Download</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <!-- Linux AppImage -->
            <tr class="hover:bg-slate-850/50 transition">
              <td class="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <span>🐧 Linux (Universal)</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">.AppImage</td>
              <td class="px-6 py-4 text-xs text-slate-400">chmod +x & execute. Runs on any Linux distro.</td>
              <td class="px-6 py-4 text-right">
                <a href="/downloads/dockmon-1.0.0.AppImage" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                  Download
                </a>
              </td>
            </tr>

            <!-- Ubuntu / Debian -->
            <tr class="hover:bg-slate-850/50 transition">
              <td class="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <span>🍥 Debian / Ubuntu</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">.deb (amd64)</td>
              <td class="px-6 py-4 text-xs font-mono text-slate-400">sudo apt install ./dockmon_1.0.0_amd64.deb</td>
              <td class="px-6 py-4 text-right">
                <a href="/downloads/dockmon_1.0.0_amd64.deb" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                  Download
                </a>
              </td>
            </tr>

            <!-- Fedora / RHEL -->
            <tr class="hover:bg-slate-850/50 transition">
              <td class="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <span>🎩 Fedora / RHEL</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">.rpm (x86_64)</td>
              <td class="px-6 py-4 text-xs font-mono text-slate-400">sudo dnf install ./dockmon-1.0.0.x86_64.rpm</td>
              <td class="px-6 py-4 text-right">
                <a href="/downloads/dockmon-1.0.0.x86_64.rpm" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                  Download
                </a>
              </td>
            </tr>

            <!-- Windows Setup -->
            <tr class="hover:bg-slate-850/50 transition">
              <td class="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <span>🪟 Windows 10/11</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">Setup (.exe)</td>
              <td class="px-6 py-4 text-xs text-slate-400">Standard desktop installer with desktop shortcut.</td>
              <td class="px-6 py-4 text-right">
                <a href="/downloads/DockMon-Setup-1.0.0.exe" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                  Download
                </a>
              </td>
            </tr>

            <!-- Windows Portable -->
            <tr class="hover:bg-slate-850/50 transition">
              <td class="px-6 py-4 font-semibold text-white flex items-center gap-3">
                <span>🪟 Windows Portable</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">Standalone (.exe)</td>
              <td class="px-6 py-4 text-xs text-slate-400">Zero installation required. Portable binary.</td>
              <td class="px-6 py-4 text-right">
                <a href="/downloads/DockMon-1.0.0-portable.exe" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition">
                  Download
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-12 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <p>&copy; 2026 <a href="https://zephyrus-labs.tech/" class="text-slate-400 hover:text-white">Zephyrus Labs</a>. All rights reserved. Released under the MIT License.</p>
        <p class="mt-1">Lead Developer: <a href="https://www.linkedin.com/in/shubham-sharma-28487819b/" class="text-indigo-400 hover:underline">Shubham Sharma</a> (<a href="https://github.com/uchiha-fire" class="hover:text-slate-300">@uchiha-fire</a>)</p>
      </div>
      <div class="flex items-center space-x-6">
        <a href="https://github.com/uchiha-fire/vps-monitoring-tool" class="hover:text-white transition">GitHub Repository</a>
        <a href="https://github.com/uchiha-fire/vps-monitoring-tool/issues" class="hover:text-white transition">Report an Issue</a>
        <a href="mailto:zephyrus.labs@gmail.com" class="hover:text-white transition">Contact</a>
      </div>
    </div>
  </footer>

  <!-- OS Detector Script -->
  <script src="/os-detector.js"></script>
</body>
</html>
```

---

## 5. Web Server Configuration on the VPS

To host this website on your VPS, you need a web server that handles:
1. Serving static files (`index.html`, `os-detector.js`).
2. Serving large binary files efficiently with correct `Content-Disposition: attachment` headers and MIME types.
3. Automatically obtaining and renewing SSL certificates (HTTPS).

Here are two complete, production-ready setups:

### Setup 1: Caddy Server (Recommended - Easiest & Automatic SSL)

Caddy includes automatic HTTPS via Let's Encrypt with zero configuration.

#### Directory Layout on VPS:
```text
/opt/vps-monitor-site/
├── Caddyfile
├── docker-compose.yml
├── public/
│   ├── index.html
│   └── os-detector.js
└── downloads/
    ├── VPS-Docker-Monitor-1.0.0.AppImage
    ├── vps-docker-monitor_1.0.0_amd64.deb
    ├── vps-docker-monitor-1.0.0.x86_64.rpm
    ├── VPS-Docker-Monitor-Setup-1.0.0.exe
    └── VPS-Docker-Monitor-1.0.0-portable.exe
```

#### `Caddyfile`:
```caddy
yourdomain.com {
    root * /srv/public
    file_server

    # Binary download endpoint
    handle_path /downloads/* {
        root * /srv/downloads
        file_server {
            browse
        }
        header Content-Disposition "attachment"
    }

    # Enable Gzip and Zstandard compression for HTML/JS
    encode zstd gzip

    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

#### `docker-compose.yml`:
```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./public:/srv/public:ro
      - ./downloads:/srv/downloads:ro
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

---

### Setup 2: Nginx + Certbot (Alternative Classic Setup)

If your VPS already runs Nginx:

#### `/etc/nginx/sites-available/vps-monitor.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/vps-monitor/public;
    index index.html;

    # Compression for static files
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # Website frontend
    location / {
        try_files $uri $uri/ =404;
    }

    # Binary downloads directory
    location /downloads/ {
        alias /var/www/vps-monitor/downloads/;
        sendfile on;
        sendfile_max_chunk 1m;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types {
            application/x-executable AppImage;
            application/vnd.debian.binary-package deb;
            application/x-rpm rpm;
            application/vnd.microsoft.portable-executable exe;
        }
        default_type application/octet-stream;
        add_header Content-Disposition "attachment";
    }
}
```

---

## 6. How to Deploy the Binaries to the VPS

### 6.1 Manual Direct Upload via `scp` or `rsync`
From your local build machine (where `release/` contains the built binaries):

```bash
# Upload all compiled binaries to the VPS downloads directory
rsync -avz --progress release/*.AppImage release/*.deb release/*.rpm release/*.exe user@your-vps-ip:/opt/vps-monitor-site/downloads/
```

### 6.2 Automated Deployment via GitHub Actions
Add this step to your `.github/workflows/release.yml` so that whenever a new tag (e.g. `v1.0.0`) is pushed, the binaries are automatically copied to your VPS:

```yaml
      - name: Deploy Binaries to Self-Hosted VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          source: "release/*.AppImage,release/*.deb,release/*.rpm,release/*.exe"
          target: "/opt/vps-monitor-site/downloads"
          strip_components: 1
```

---

## 7. Instructions for Any Subsequent AI Agent or Developer

When handing this specification over to another AI LLM or engineer, provide them with this prompt:

```text
Please read the guide at docs/website_hosting_and_distribution_guide.md.
Task:
1. Build and test the static or framework-based landing page for VPS Docker Monitor matching the Zephyrus Labs branding guidelines.
2. Implement the OS auto-detection script (os-detector.js) so users visiting from Windows or Linux see their respective one-click download buttons.
3. Include the complete downloads table offering .AppImage, .deb, .rpm, and .exe files.
4. Provide the Docker Compose and Caddyfile/Nginx configuration to deploy this on a VPS with automated HTTPS.
```

---

## 8. Summary Checklist Before Going Live

- [ ] Domain DNS `A` record pointing to VPS IP address.
- [ ] Port `80` and `443` open in VPS firewall (`ufw allow 80/tcp && ufw allow 443/tcp`).
- [ ] Directory `/opt/vps-monitor-site/downloads` populated with binary files.
- [ ] `index.html` and `os-detector.js` placed in `/opt/vps-monitor-site/public`.
- [ ] `docker compose up -d` executed.
- [ ] Test download from browser on Windows, Linux, and Mobile.
