# DockMon Website UI: macOS Support & Website Update Specifications

> **Target Audience**: Frontend Engineers, Designers, and AI Agents working on the **DockMon** landing page (`/home/shubham/startups/vps_monitoring_spa`).  
> **Repository Context**: Desktop App (`vps_monitoring`) $\rightarrow$ Website SPA (`vps_monitoring_spa`).  
> **Brand & Maintainer**: [DockMon](https://dockmon.zephyrus-labs.tech/) &bull; [Zephyrus Labs](https://zephyrus-labs.tech/) &bull; [Shubham Sharma](https://www.linkedin.com/in/shubham-sharma-28487819b/) (`@uchiha-fire`).  
> **Version**: 1.0.0  

---

## 1. Executive Summary

DockMon has completed its multi-phased macOS rollout. The desktop app now natively supports macOS with **distinct standalone binaries** for **Apple Silicon (`arm64`)** and **Intel (`x64`)**, avoiding universal binary bloat.

Because DockMon is a 100% free community open-source project without a paid ($99/year) Apple Developer ID certificate, macOS Gatekeeper presents a standard *"unverified developer"* alert on first launch.

### What the UI Team Needs to Update:
1. **Hero Download CTA & Dropdown**: Replace the generic "macOS Universal" button with dynamic detection of **Apple Silicon (`arm64`)** vs. **Intel (`x64`)**.
2. **Downloads Table**: Split the single macOS row into two distinct rows:
   - **macOS Apple Silicon (M1/M2/M3/M4)** (`.dmg` installer + `.zip` standalone).
   - **macOS Intel (64-bit)** (`.dmg` installer + `.zip` standalone).
3. **Quick Installation Guide (`install-guide-card`)**: Add a dedicated **🍎 macOS** tab featuring the DMG drag-to-Applications flow and clear Gatekeeper bypass instructions.
4. **FAQ Section**: Add an answer explaining why the Gatekeeper warning appears and how to bypass it safely in under 5 seconds.
5. **Client OS Auto-Detector (`os-detector.js`)**: Update the catalog with distinct `mac-arm` and `mac-intel` profiles and enhance detection to identify Apple Silicon vs. Intel Macs.
6. **Badges & Attribution**: Update test badge to **57 passing tests** and ensure Lead Developer **Shubham Sharma's LinkedIn** is linked in the footer and team credits.

---

## 2. Complete Asset & Download URL Matrix

All artifacts are hosted locally under `/downloads/` on the website server and mirrored on GitHub Releases:

| OS / Architecture | Format | File Name | Local Website URL | GitHub Releases Fallback URL |
| :--- | :--- | :--- | :--- | :--- |
| **macOS Apple Silicon** (M1/M2/M3/M4) | **DMG Installer** | `DockMon-1.0.0-arm64.dmg` | `/downloads/DockMon-1.0.0-arm64.dmg` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-1.0.0-arm64.dmg` |
| **macOS Apple Silicon** (M1/M2/M3/M4) | **Portable ZIP** | `DockMon-1.0.0-arm64.zip` | `/downloads/DockMon-1.0.0-arm64.zip` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-1.0.0-arm64.zip` |
| **macOS Intel** (x86_64) | **DMG Installer** | `DockMon-1.0.0-x64.dmg` | `/downloads/DockMon-1.0.0-x64.dmg` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-1.0.0-x64.dmg` |
| **macOS Intel** (x86_64) | **Portable ZIP** | `DockMon-1.0.0-x64.zip` | `/downloads/DockMon-1.0.0-x64.zip` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-1.0.0-x64.zip` |
| **Linux (Universal)** | **AppImage** | `dockmon-1.0.0.AppImage` | `/downloads/dockmon-1.0.0.AppImage` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/dockmon-1.0.0.AppImage` |
| **Debian / Ubuntu / Mint** | **.deb** | `dockmon-1.0.0.deb` | `/downloads/dockmon-1.0.0.deb` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/dockmon-1.0.0.deb` |
| **Fedora / RHEL** | **.rpm** | `dockmon-1.0.0.rpm` | `/downloads/dockmon-1.0.0.rpm` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/dockmon-1.0.0.rpm` |
| **Windows 10 / 11** | **Setup (.exe)** | `DockMon-Setup-1.0.0.exe` | `/downloads/DockMon-Setup-1.0.0.exe` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-Setup-1.0.0.exe` |
| **Windows Portable** | **Portable (.exe)**| `DockMon-1.0.0-portable.exe` | `/downloads/DockMon-1.0.0-portable.exe` | `https://github.com/uchiha-fire/vps-monitoring-tool/releases/download/v1.0.0/DockMon-1.0.0-portable.exe` |

---

## 3. UI Component Changes (`public/index.html`)

### 3.1 Hero Section Dropdown Update (Lines ~115–130)
Replace the single macOS link in the hero dropdown with distinct options for Apple Silicon and Intel:

```html
<!-- In #hero-dropdown-menu -->
<div class="dropdown-divider"></div>
<div class="dropdown-group-header">Apple macOS</div>
<a href="/downloads/DockMon-1.0.0-arm64.dmg" download="DockMon-1.0.0-arm64.dmg" class="dropdown-item">
  <span class="dropdown-item-title">🍎 macOS Apple Silicon (.dmg)</span>
  <span class="dropdown-item-sub">Native M1 / M2 / M3 / M4 (~82 MB)</span>
</a>
<a href="/downloads/DockMon-1.0.0-x64.dmg" download="DockMon-1.0.0-x64.dmg" class="dropdown-item">
  <span class="dropdown-item-title">🍎 macOS Intel (.dmg)</span>
  <span class="dropdown-item-sub">64-bit Intel Mac (~86 MB)</span>
</a>
```

---

### 3.2 Downloads Table: Distinct macOS Rows (Replacing Row 6, Lines ~789–828)

Replace the old universal row with these two distinct rows in `<tbody id="downloads-tbody">`:

```html
<!-- Row 6A: macOS Apple Silicon -->
<tr data-platform-row="mac">
  <td>
    <div class="platform-cell">
      <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/>
      </svg>
      <div>
        <div style="font-weight:600;color:#fff;">macOS Apple Silicon</div>
        <span class="size-chip">~82 MB &bull; Optimized for M1, M2, M3, M4</span>
      </div>
    </div>
  </td>
  <td>
    <span class="format-chip">.dmg</span>
    <span class="arch-chip font-mono">arm64</span>
  </td>
  <td>
    <div class="command-snippet-box multi-step">
      <div class="step-label">Drag & Drop:</div>
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
        <span class="command-snippet-text font-mono" style="font-size:0.75rem;">Open .dmg & drag DockMon to Applications</span>
        <button class="copy-icon-btn" onclick="copyInstallCommand('xattr -cr /Applications/DockMon.app', this)" title="Copy Gatekeeper unlock command">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div class="step-subtext">
        First launch: Right-click &rarr; Open (or run <code>xattr -cr</code>).
      </div>
    </div>
  </td>
  <td style="text-align:right;">
    <div class="download-action-group">
      <a href="/downloads/DockMon-1.0.0-arm64.zip" download="DockMon-1.0.0-arm64.zip" class="table-checksum-btn" title="Download standalone ZIP">.ZIP</a>
      <a href="/downloads/DockMon-1.0.0-arm64.dmg" download="DockMon-1.0.0-arm64.dmg" class="table-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download .DMG
      </a>
    </div>
  </td>
</tr>

<!-- Row 6B: macOS Intel -->
<tr data-platform-row="mac">
  <td>
    <div class="platform-cell">
      <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/>
      </svg>
      <div>
        <div style="font-weight:600;color:#fff;">macOS Intel</div>
        <span class="size-chip">~86 MB &bull; 64-bit Intel Mac</span>
      </div>
    </div>
  </td>
  <td>
    <span class="format-chip">.dmg</span>
    <span class="arch-chip font-mono">x64</span>
  </td>
  <td>
    <div class="command-snippet-box multi-step">
      <div class="step-label">Drag & Drop:</div>
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
        <span class="command-snippet-text font-mono" style="font-size:0.75rem;">Open .dmg & drag DockMon to Applications</span>
        <button class="copy-icon-btn" onclick="copyInstallCommand('xattr -cr /Applications/DockMon.app', this)" title="Copy Gatekeeper unlock command">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div class="step-subtext">
        First launch: Right-click &rarr; Open (or run <code>xattr -cr</code>).
      </div>
    </div>
  </td>
  <td style="text-align:right;">
    <div class="download-action-group">
      <a href="/downloads/DockMon-1.0.0-x64.zip" download="DockMon-1.0.0-x64.zip" class="table-checksum-btn" title="Download standalone ZIP">.ZIP</a>
      <a href="/downloads/DockMon-1.0.0-x64.dmg" download="DockMon-1.0.0-x64.dmg" class="table-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download .DMG
      </a>
    </div>
  </td>
</tr>
```

---

### 3.3 Quick Install Guide: Adding the macOS Tab (Lines ~845–935)

#### 1. In `.install-guide-tabs` (around line 851):
Add the macOS button to the tab header:
```html
<button class="preset-chip-btn" data-guide-tab="mac" onclick="switchInstallGuideTab('tab-guide-mac', this)">🍎 macOS (DMG & Gatekeeper)</button>
```

#### 2. In the tab content panels:
Insert the following `#tab-guide-mac` panel:
```html
<!-- Tab 6: macOS Installation & Gatekeeper Bypass -->
<div id="tab-guide-mac" class="install-guide-content" style="display:none;">
  <div class="mac-guide-container">
    <ol class="install-guide-list">
      <li>
        <strong>Step 1: Download the right build for your Mac:</strong>
        <div style="display:flex;gap:12px;margin:8px 0;flex-wrap:wrap;">
          <a href="/downloads/DockMon-1.0.0-arm64.dmg" class="table-download-btn" style="padding:6px 14px;font-size:0.8rem;">
            🍏 Apple Silicon (.dmg)
          </a>
          <a href="/downloads/DockMon-1.0.0-x64.dmg" class="table-download-btn" style="padding:6px 14px;font-size:0.8rem;background:rgba(255,255,255,0.08);">
            🖥️ Intel Mac (.dmg)
          </a>
        </div>
      </li>
      <li>
        <strong>Step 2: Install:</strong> Open the downloaded <code>.dmg</code> file and drag the <strong>DockMon</strong> icon into your <strong>Applications</strong> folder.
      </li>
      <li>
        <strong>Step 3: First-time Launch (Gatekeeper Notice):</strong>
        <p style="margin:4px 0 8px;font-size:0.82rem;color:#cbd5e1;">
          DockMon is free, open-source software built by Zephyrus Labs. Because it is distributed without an expensive ($99/year) Apple Developer Certificate, macOS Gatekeeper will show an <em>"unverified developer"</em> warning on first launch.
        </p>
        
        <div class="gatekeeper-box">
          <div class="gatekeeper-title">
            <span>🔓 How to open DockMon (Pick any method):</span>
          </div>
          <ul class="gatekeeper-methods">
            <li>
              <strong>Method 1 (Fastest)</strong>: Right-click (or Control-click) <code>DockMon.app</code> in your Applications folder &rarr; click <strong>Open</strong> &rarr; click <strong>Open</strong> in the confirmation box. (Only needed once).
            </li>
            <li>
              <strong>Method 2 (Terminal Command)</strong>: Strip the quarantine attribute:
              <div class="command-snippet-box" style="margin-top:6px;background:#020617;max-width:100%;">
                <span class="command-snippet-text font-mono" style="color:#38bdf8;">xattr -cr /Applications/DockMon.app</span>
                <button class="copy-icon-btn" onclick="copyInstallCommand('xattr -cr /Applications/DockMon.app', this)" title="Copy command">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>
            </li>
            <li>
              <strong>Method 3 (System Settings)</strong>: Go to <strong>System Settings</strong> &rarr; <strong>Privacy & Security</strong> &rarr; scroll down to <strong>Security</strong> &rarr; click <strong>"Open Anyway"</strong> next to DockMon.
            </li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
</div>
```

---

### 3.4 FAQ Section: Gatekeeper Question

Add this question inside `<div class="faq-container">` (lines ~948–1050):

```html
<!-- macOS Gatekeeper FAQ -->
<div class="faq-item">
  <button class="faq-question" onclick="toggleFaq(this)">
    <span>Why does macOS say "DockMon cannot be opened because the developer cannot be verified"?</span>
    <svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
  </button>
  <div class="faq-answer">
    <p>
      DockMon is an independent, 100% free open-source tool. Apple requires developers to pay an annual $99/year subscription and submit binaries through their automated notarization service to suppress the warning dialog.
    </p>
    <p style="margin-top:8px;">
      To open DockMon the first time: simply <strong>Right-click (or Control-click)</strong> <code>DockMon.app</code> in your Applications folder and choose <strong>Open</strong>. Alternatively, run:
    </p>
    <div class="command-snippet-box" style="margin-top:6px;background:#020617;">
      <code class="font-mono" style="color:#38bdf8;font-size:0.8rem;">xattr -cr /Applications/DockMon.app</code>
    </div>
  </div>
</div>
```

---

### 3.5 Lead Developer Attribution & Test Badge Updates

1. **Test Badge**: Change badge to `57 passing tests`:
   ```html
   <span class="badge-emerald">57 Passing Tests (100% TDD)</span>
   ```
2. **Footer Credits**: Ensure Shubham Sharma's LinkedIn link is present:
   ```html
   <a href="https://www.linkedin.com/in/shubham-sharma-28487819b/" target="_blank" rel="noopener noreferrer" class="footer-link">
     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
     LinkedIn
   </a>
   ```

---

## 4. JavaScript Logic Updates (`public/os-detector.js`)

In `public/os-detector.js`, replace the single `mac` key in `DOWNLOAD_CATALOG` with `mac-arm` and `mac-intel`:

```javascript
const DOWNLOAD_CATALOG = {
  // ... existing linux and windows configs ...

  'mac-arm': {
    key: 'mac-arm',
    osName: 'macOS Apple Silicon',
    osType: 'mac',
    label: 'Download for Apple Silicon',
    sublabel: 'Native M1, M2, M3, M4 • (.dmg) • ~82 MB',
    filename: `DockMon-${APP_VERSION}-arm64.dmg`,
    url: `${RELEASE_BASE_URL}/DockMon-${APP_VERSION}-arm64.dmg`,
    zipUrl: `${RELEASE_BASE_URL}/DockMon-${APP_VERSION}-arm64.zip`,
    size: '~82 MB',
    format: 'Apple Disk Image (.dmg)',
    command: 'xattr -cr /Applications/DockMon.app',
    icon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/></svg>`
  },

  'mac-intel': {
    key: 'mac-intel',
    osName: 'macOS Intel',
    osType: 'mac',
    label: 'Download for macOS Intel',
    sublabel: '64-bit Intel Mac • (.dmg) • ~86 MB',
    filename: `DockMon-${APP_VERSION}-x64.dmg`,
    url: `${RELEASE_BASE_URL}/DockMon-${APP_VERSION}-x64.dmg`,
    zipUrl: `${RELEASE_BASE_URL}/DockMon-${APP_VERSION}-x64.zip`,
    size: '~86 MB',
    format: 'Apple Disk Image (.dmg)',
    command: 'xattr -cr /Applications/DockMon.app',
    icon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.72-.93 2.74 1 .08 2.02-.49 2.64-1.24z"/></svg>`
  }
};
```

### Apple Silicon vs. Intel Browser Detection Helper:
```javascript
/**
 * Detects whether a macOS visitor is running on Apple Silicon (arm64) or Intel (x64).
 * @returns {Promise<'mac-arm' | 'mac-intel'>}
 */
async function detectMacArchitecture() {
  // Method 1: Modern User-Agent Client Hints API
  if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
    try {
      const hints = await navigator.userAgentData.getHighEntropyValues(['architecture']);
      if (hints.architecture === 'arm') {
        return 'mac-arm';
      }
      if (hints.architecture === 'x86') {
        return 'mac-intel';
      }
    } catch (_) {}
  }

  // Method 2: WebGL GPU Renderer query (Apple M1/M2/M3/M4 report Apple GPU)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        if (renderer.toLowerCase().includes('apple')) {
          return 'mac-arm';
        }
        if (renderer.toLowerCase().includes('intel')) {
          return 'mac-intel';
        }
      }
    }
  } catch (_) {}

  // Fallback: Default to Apple Silicon (arm64) as modern standard for Macs sold since 2020
  return 'mac-arm';
}
```

---

## 5. CSS Additions (`public/styles.css`)

Add these styles for the Gatekeeper warning box and multi-method list:

```css
/* Gatekeeper Guidance Box */
.gatekeeper-box {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(245, 158, 11, 0.35); /* Subtle Amber accent */
  border-radius: 8px;
  padding: 14px 16px;
  margin-top: 10px;
}

.gatekeeper-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #fbbf24; /* Amber-400 */
  margin-bottom: 8px;
}

.gatekeeper-methods {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.gatekeeper-methods li {
  line-height: 1.45;
}

.gatekeeper-methods code {
  background: #020617;
  padding: 2px 6px;
  border-radius: 4px;
  color: #38bdf8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

---

## 6. QA Verification Checklist

Before publishing the updated website, test the following:

- [ ] **Hero Button Auto-Detection**:
  - Visiting from an Apple Silicon Mac shows *"Download for Apple Silicon"* (`DockMon-1.0.0-arm64.dmg`).
  - Visiting from an Intel Mac shows *"Download for macOS Intel"* (`DockMon-1.0.0-x64.dmg`).
  - Dropdown displays both options explicitly.
- [ ] **Table Rows**:
  - Filtering by `mac` displays both Apple Silicon and Intel rows.
  - Clicking `.DMG` downloads the `.dmg` file.
  - Clicking `.ZIP` downloads the standalone `.zip` archive.
- [ ] **Quick Install Guide Tab**:
  - Clicking the 🍎 macOS tab displays the 3-step installation and Gatekeeper instructions.
  - Copy button for `xattr -cr /Applications/DockMon.app` works and displays feedback tooltip.
- [ ] **FAQ Item**:
  - Clicking the Gatekeeper accordion question expands with instructions.
- [ ] **Developer Attribution**:
  - Shubham Sharma's LinkedIn profile link opens in a new tab with `rel="noopener noreferrer"`.
- [ ] **Test Badge**:
  - Shows 57 passing tests.
