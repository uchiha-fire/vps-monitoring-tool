# Complete Guide: Rebranding the Landing Page SPA to DockMon

> **Target Workspace**: `/home/shubham/startups/vps_monitoring_spa`
> **Target Domain**: `https://dockmon.zephyrus-labs.tech`
> **Product Name**: **DockMon** &bull; **Organization**: [Zephyrus Labs](https://zephyrus-labs.tech/) &bull; **Lead Developer**: [Shubham Sharma](https://github.com/uchiha-fire)
> **License**: MIT License

---

## 1. Objective & Context

The desktop application has been officially rebranded from *VPS Docker Monitor* to **DockMon**, and the binaries are now packaged as `dockmon-1.0.0.AppImage`, `dockmon-1.0.0.deb`, and `DockMon-Setup-1.0.0.exe`.

This document provides step-by-step instructions for any AI Agent or developer to update the Single Page Application (SPA) distribution server located at `/home/shubham/startups/vps_monitoring_spa` to:
1. Feature the official **DockMon** branding and logo.
2. Route traffic on the custom domain **`dockmon.zephyrus-labs.tech`**.
3. Align all automated OS-detection download buttons with the new binary file names.
4. Run securely with automated HTTPS via Caddy and Docker Compose.

---

## 2. Brand & Asset Architecture

| Property | Value |
| :--- | :--- |
| **Product Name** | **DockMon** |
| **Product Tagline** | *Agentless Remote Docker & Compose Monitor* |
| **Official Domain** | `https://dockmon.zephyrus-labs.tech/` |
| **Logo File** | `/srv/public/logo.png` (Source: `docs/logo.png`) |
| **Favicon** | `/srv/public/logo.png` (or icon derivative) |
| **Parent Organization** | [Zephyrus Labs](https://zephyrus-labs.tech/) (`zephyrus.labs@gmail.com`) |
| **Lead Developer** | [Shubham Sharma](https://github.com/uchiha-fire) (`sharmashubham25962@gmail.com`) |

---

## 3. Step-by-Step File Modifications

### 3.1 Environment Configuration (`.env` and `.env.example`)
Set the production domain to `dockmon.zephyrus-labs.tech`:

```bash
# /home/shubham/startups/vps_monitoring_spa/.env
SITE_DOMAIN=dockmon.zephyrus-labs.tech
ACME_EMAIL=zephyrus.labs@gmail.com
DOWNLOAD_SOURCE=local
VERSION=1.0.0
```

---

### 3.2 Caddy Server (`Caddyfile`)
Update the default fallback in the `Caddyfile` to use `dockmon.zephyrus-labs.tech`:

```caddy
# /home/shubham/startups/vps_monitoring_spa/Caddyfile

{
    # Global options
    email {$ACME_EMAIL:zephyrus.labs@gmail.com}
}

# Production domain block
{$SITE_DOMAIN:dockmon.zephyrus-labs.tech} {
    root * /srv/public
    file_server

    # Binary download endpoint
    handle_path /downloads/* {
        root * /srv/downloads
        file_server {
            browse
        }
        header Content-Disposition "attachment"
        header Cache-Control "public, max-age=86400"
    }

    # Compression for text assets
    encode zstd gzip

    # Modern Security Headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }

    log {
        output stdout
        format console
    }
}
```

---

### 3.3 Dynamic OS Detection (`public/os-detector.js`)
Update the download configurations and filenames to match the newly built binaries:

```javascript
// /home/shubham/startups/vps_monitoring_spa/public/os-detector.js

function detectClientOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  if (navigator.userAgentData?.platform) {
    const hintPlatform = navigator.userAgentData.platform.toLowerCase();
    if (hintPlatform.includes('win')) return 'windows';
    if (hintPlatform.includes('mac')) return 'mac';
    if (hintPlatform.includes('linux')) return 'linux';
  }

  if (ua.includes('win') || platform.includes('win')) return 'windows';
  if (ua.includes('mac') || platform.includes('mac')) return 'mac';
  if (ua.includes('linux') || platform.includes('linux')) return 'linux';
  if (/android|iphone|ipad|ipod/.test(ua)) return 'mobile';

  return 'unknown';
}

const RELEASE_BASE_URL = '/downloads';
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

### 3.4 HTML Landing Page (`public/index.html`)

1. **Title & Meta Tags**:
   ```html
   <title>DockMon - Agentless Remote Docker & Compose Monitor</title>
   <meta name="description" content="Lightweight desktop application by Zephyrus Labs to monitor remote Linux VPS Docker containers and Compose stacks over pure SSH. Zero agents required.">
   <meta property="og:title" content="DockMon - Native Remote Docker Management">
   <meta property="og:url" content="https://dockmon.zephyrus-labs.tech/">
   <link rel="icon" type="image/png" href="/logo.png">
   ```

2. **Navbar Header**:
   Replace generic terminal icon with the new logo image:
   ```html
   <a href="#" class="brand-logo" aria-label="DockMon Home">
     <img src="/logo.png" alt="DockMon Logo" class="w-8 h-8 object-contain rounded-lg" />
     <span class="font-bold text-lg text-white">DockMon</span>
     <span class="brand-version-chip">v1.0.0</span>
   </a>
   ```

3. **Hero Section**:
   ```html
   <div class="announcement-pill">
     <span class="status-dot"></span>
     <span>Zephyrus Labs Release &bull; <strong>100% Agentless &bull; Pure SSH Port 22</strong></span>
   </div>
   <h1 class="hero-title">
     Remote Docker Stacks Managed <br class="hidden sm:inline">
     <span class="gradient-text">Without Opening Daemon Ports</span>
   </h1>
   <p class="hero-subtitle">
     Connect to your VPS via SSH. Inspect Compose stacks, stream real-time ANSI logs, and restart services with zero agent software installed.
   </p>
   ```

4. **All Downloads Table**:
   Update all rows to link to `/downloads/dockmon-...` and `/downloads/DockMon-...`:

   | OS | Format | Filename | Download URL |
   | :--- | :--- | :--- | :--- |
   | **Linux (Universal)** | `.AppImage` | `dockmon-1.0.0.AppImage` | `/downloads/dockmon-1.0.0.AppImage` |
   | **Debian / Ubuntu** | `.deb` (amd64) | `dockmon-1.0.0.deb` | `/downloads/dockmon-1.0.0.deb` |
   | **Fedora / RHEL** | `.rpm` (x86_64)| `dockmon-1.0.0.rpm` | `/downloads/dockmon-1.0.0.rpm` |
   | **Windows 10/11** | Setup (`.exe`) | `DockMon-Setup-1.0.0.exe` | `/downloads/DockMon-Setup-1.0.0.exe` |
   | **Windows Portable** | Standalone (`.exe`) | `DockMon-1.0.0-portable.exe` | `/downloads/DockMon-1.0.0-portable.exe` |

5. **Footer Branding**:
   ```html
   <footer>
     <p>&copy; 2026 <a href="https://zephyrus-labs.tech/">Zephyrus Labs</a>. Released under the MIT License.</p>
     <p>Lead Developer: <a href="https://www.linkedin.com/in/shubham-sharma-28487819b/">Shubham Sharma</a> (<a href="https://github.com/uchiha-fire">@uchiha-fire</a>)</p>
   </footer>
   ```

---

## 4. Populating the Downloads Directory

Copy the newly built Linux binaries from `/home/shubham/startups/vps_monitoring/release/` into `/home/shubham/startups/vps_monitoring_spa/downloads/`:

```bash
cd /home/shubham/startups/vps_monitoring
cp release/dockmon-1.0.0.AppImage /home/shubham/startups/vps_monitoring_spa/downloads/
cp release/dockmon-1.0.0.deb /home/shubham/startups/vps_monitoring_spa/downloads/
```

---

## 5. Live VPS Deployment Instructions

### 5.1 DNS Configuration
Add a DNS record at your domain registrar/DNS provider for `zephyrus-labs.tech`:
- **Type**: `A`
- **Name / Host**: `dockmon`
- **Value / IPv4**: `<Your-VPS-Public-IP>`
- **TTL**: `300` (or Auto)

### 5.2 Server Firewall
Ensure standard HTTP/HTTPS ports are open on the VPS:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 5.3 Launch with Docker Compose
On your VPS (or locally for testing):
```bash
cd /opt/vps-monitor-site # or /home/shubham/startups/vps_monitoring_spa
docker compose up -d --build
```

Caddy will automatically contact Let's Encrypt, provision a valid TLS/SSL certificate for `dockmon.zephyrus-labs.tech`, and begin serving both the landing page and binary downloads.

---

## 6. Prompt for Any Future AI Agent or Developer

Pass this prompt to any LLM or developer working on the SPA repository:

```text
Please read the comprehensive guide in docs/spa_dockmon_rebranding_guide.md.
Task:
1. Update /home/shubham/startups/vps_monitoring_spa to full DockMon branding.
2. Configure SITE_DOMAIN to dockmon.zephyrus-labs.tech in Caddyfile and .env.
3. Update public/os-detector.js and public/index.html with the new dockmon binary names and logo.png.
4. Verify all downloads point to /downloads/dockmon-1.0.0.AppImage, /downloads/dockmon-1.0.0.deb, and /downloads/DockMon-Setup-1.0.0.exe.
```
