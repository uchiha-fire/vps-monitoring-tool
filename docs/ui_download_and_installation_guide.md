# DockMon Website UI: Download & Installation Instructions Guide

> **Target Audience**: Frontend Engineers, Designers, and AI Agents working on the **DockMon** landing page (`/home/shubham/startups/vps_monitoring_spa`).
> **Goal**: Prevent user terminal errors (e.g. `E: Unsupported file ./dockmon-1.0.0.deb given on commandline`) by designing clear, high-converting, 2-step download & installation instructions across all supported platforms.
> **Brand & Project**: [DockMon](https://dockmon.zephyrus-labs.tech/) &bull; [Zephyrus Labs](https://zephyrus-labs.tech/) &bull; [Shubham Sharma](https://github.com/uchiha-fire)

---

## 1. Problem Statement & UX Analysis

### 1.1 The User Problem
When end-users see this in a web table:
```bash
sudo apt install ./dockmon-1.0.0.deb
```
They often copy-paste it directly into their terminal from their home folder (`~`). Because the file was saved by the browser into `~/Downloads/`, `apt` outputs a confusing error:
```text
E: Unsupported file ./dockmon-1.0.0.deb given on commandline
```

### 1.2 The UX Solution
The UI must make the **2-step lifecycle** visually obvious:
1. **Step 1: Download** (Saved automatically to `~/Downloads`).
2. **Step 2: Install** (Either navigate to `~/Downloads` first, specify the full path `~/Downloads/dockmon-1.0.0.deb`, or simply double-click the file in the GUI).
3. **Alternative (Terminal Power Users)**: Provide a 1-line `curl` command that downloads and installs in a single command without touching the browser.

---

## 2. Platform Instruction Matrix

| Platform | Format | Recommended UI Instruction (Step-by-Step) | 1-Line Terminal Shortcut (No Browser Needed) | GUI Alternative |
| :--- | :--- | :--- | :--- | :--- |
| **Ubuntu / Debian / Mint** | `.deb` | `cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb` | `curl -LO https://dockmon.zephyrus-labs.tech/downloads/dockmon-1.0.0.deb && sudo apt install ./dockmon-1.0.0.deb` | Double-click `.deb` file in file manager $\rightarrow$ Click **Install** in Ubuntu Software Center. |
| **Linux (Universal)** | `.AppImage` | `cd ~/Downloads && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage` | `curl -LO https://dockmon.zephyrus-labs.tech/downloads/dockmon-1.0.0.AppImage && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage` | Right-click file $\rightarrow$ **Properties** $\rightarrow$ **Permissions** $\rightarrow$ Enable **"Allow executing file as program"** $\rightarrow$ Double click. |
| **Fedora / RHEL / CentOS** | `.rpm` | `cd ~/Downloads && sudo dnf install ./dockmon-1.0.0.rpm` | `curl -LO https://dockmon.zephyrus-labs.tech/downloads/dockmon-1.0.0.rpm && sudo dnf install ./dockmon-1.0.0.rpm` | Double-click `.rpm` file to install via GNOME Software. |
| **Windows 10 / 11** | Setup (`.exe`) | Double-click `DockMon-Setup-1.0.0.exe` in your Downloads folder. | `winget install dockmon` *(Future release)* | If Windows SmartScreen appears: click **"More info"** $\rightarrow$ **"Run anyway"**. |
| **Windows 10 / 11** | Portable (`.exe`) | Move `DockMon-1.0.0-portable.exe` to any folder and double-click to launch. | N/A | Zero installation required. |
| **macOS (Intel / Apple Silicon)** | `.dmg` | Open `DockMon-1.0.0.dmg` and drag **DockMon** to **Applications**. | `brew install --cask dockmon` *(Future release)* | Standard macOS drag-and-drop installer. |

---

## 3. UI Component Specifications for `public/index.html`

Here are the 2 recommended UI patterns to implement in the landing page website:

### Pattern A: Updated Download Table Rows
In the main downloads table (`<table class="downloads-table">`), replace the single-line snippet with a tabbed or multi-line command with clear directory context.

#### 1. Debian / Ubuntu Row (Row 2 in table):
```html
<!-- Debian / Ubuntu Row -->
<tr data-platform-row="linux">
  <td>
    <div class="platform-cell">
      <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
      <div>
        <div style="font-weight:600;color:#fff;">Debian / Ubuntu / Mint</div>
        <span class="size-chip">~84 MB &bull; Native APT package</span>
      </div>
    </div>
  </td>
  <td>
    <span class="format-chip">.deb</span>
    <span class="arch-chip font-mono">amd64</span>
  </td>
  <td>
    <!-- 2-Step Terminal Command Snippet -->
    <div class="command-snippet-box" style="flex-direction:column;align-items:flex-start;gap:4px;">
      <div style="font-size:0.7rem;color:#94a3b8;display:flex;align-items:center;gap:4px;">
        <span>Step 2 (after download):</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:between;width:100%;">
        <span class="command-snippet-text font-mono" style="font-size:0.75rem;">cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb</span>
        <button class="copy-icon-btn" onclick="copyInstallCommand('cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb', this)" title="Copy command">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div style="font-size:0.68rem;color:#64748b;">
        Or double-click the downloaded <code>.deb</code> file to install via App Center.
      </div>
    </div>
  </td>
  <td style="text-align:right;">
    <div class="download-action-group">
      <button class="table-checksum-btn" onclick="openChecksumModal('linux-deb')">SHA-256</button>
      <a href="/downloads/dockmon-1.0.0.deb" download="dockmon-1.0.0.deb" class="table-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download
      </a>
    </div>
  </td>
</tr>
```

#### 2. Universal Linux AppImage Row (Row 1 in table):
```html
<!-- Linux AppImage Row -->
<tr data-platform-row="linux">
  <td>
    <div class="platform-cell">
      <svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 2c-2.32 0-4.084 1.777-4.084 4.098 0 .548.105 1.107.29 1.625C7.26 8.358 6.5 9.49 6.5 10.825c0 1.253.642 2.33 1.588 3.012-.057.258-.088.528-.088.805 0 2.213 1.79 4.008 4 4.008 2.21 0 4-1.795 4-4.008 0-.277-.03-.547-.088-.805.946-.682 1.588-1.76 1.588-3.012 0-1.335-.76-2.467-1.71-3.102.186-.518.291-1.077.291-1.625 0-2.321-1.764-4.098-4.084-4.098zm-1.8 4.2c.497 0 .9.403.9.9s-.403.9-.9.9-.9-.403-.9-.9.403-.9.9-.9zm3.6 0c.497 0 .9.403.9.9s-.403.9-.9.9-.9-.403-.9-.9.403-.9.9-.9zM12 9c.7 0 1.35.3 1.8.8l-3.6 0C10.65 9.3 11.3 9 12 9z"/></svg>
      <div>
        <div style="font-weight:600;color:#fff;">Linux (Universal)</div>
        <span class="size-chip">~108 MB &bull; Standalone executable</span>
      </div>
    </div>
  </td>
  <td>
    <span class="format-chip">.AppImage</span>
    <span class="arch-chip font-mono">x86_64</span>
  </td>
  <td>
    <div class="command-snippet-box" style="flex-direction:column;align-items:flex-start;gap:4px;">
      <div style="font-size:0.7rem;color:#94a3b8;">Step 2 (after download):</div>
      <div style="display:flex;align-items:center;justify-content:between;width:100%;">
        <span class="command-snippet-text font-mono" style="font-size:0.75rem;">cd ~/Downloads && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage</span>
        <button class="copy-icon-btn" onclick="copyInstallCommand('cd ~/Downloads && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage', this)" title="Copy command">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
      <div style="font-size:0.68rem;color:#64748b;">
        Runs instantly on any distro without root permissions.
      </div>
    </div>
  </td>
  <td style="text-align:right;">
    <div class="download-action-group">
      <button class="table-checksum-btn" onclick="openChecksumModal('linux')">SHA-256</button>
      <a href="/downloads/dockmon-1.0.0.AppImage" download="dockmon-1.0.0.AppImage" class="table-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download
      </a>
    </div>
  </td>
</tr>
```

---

### Pattern B: Dedicated "Quick Installation Guide" Card Section
Place this visual 3-tab card right beneath the Downloads Table or above the FAQ in `public/index.html`. It gives users interactive tabs for **Ubuntu/Debian**, **Fedora/RHEL**, and **AppImage**:

```html
<!-- Quick Installation Guide Component -->
<div class="install-guide-card" style="margin-top:2rem;background:#0f172a;border:1px solid #1e293b;border-radius:1rem;padding:1.5rem;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;border-bottom:1px solid #1e293b;padding-bottom:0.75rem;">
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span style="font-size:1.1rem;">⚡</span>
      <h3 style="font-size:1rem;font-weight:700;color:#f8fafc;margin:0;">How to Install & Run DockMon</h3>
    </div>
    <div style="font-size:0.75rem;color:#94a3b8;">
      Choose your platform:
    </div>
  </div>

  <!-- Instruction Tabs -->
  <div style="display:flex;gap:0.5rem;margin-bottom:1rem;" id="install-guide-tabs">
    <button class="preset-chip-btn active" onclick="switchInstallGuideTab('tab-guide-deb', this)">🍥 Ubuntu / Debian (.deb)</button>
    <button class="preset-chip-btn" onclick="switchInstallGuideTab('tab-guide-appimage', this)">🐧 Universal AppImage</button>
    <button class="preset-chip-btn" onclick="switchInstallGuideTab('tab-guide-terminal', this)">💻 1-Line Terminal Direct</button>
    <button class="preset-chip-btn" onclick="switchInstallGuideTab('tab-guide-windows', this)">🪟 Windows Setup</button>
  </div>

  <!-- Tab 1: Ubuntu / Debian -->
  <div id="tab-guide-deb" class="install-guide-content">
    <ol style="margin:0;padding-left:1.2rem;color:#cbd5e1;font-size:0.875rem;line-height:1.7;">
      <li>Click <strong>Download</strong> above to save <code>dockmon-1.0.0.deb</code> into your <strong>Downloads</strong> folder.</li>
      <li>Open your terminal and run:
        <div class="command-snippet-box" style="margin:0.5rem 0;background:#020617;">
          <span class="command-snippet-text font-mono" style="color:#38bdf8;">cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb</span>
          <button class="copy-icon-btn" onclick="copyInstallCommand('cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </li>
      <li><em>(Alternative GUI)</em>: Double-click <code>dockmon-1.0.0.deb</code> in your file manager to install via Ubuntu App Center.</li>
      <li>Launch DockMon from your applications menu or by typing <code>dockmon</code> in terminal!</li>
    </ol>
  </div>

  <!-- Tab 2: Universal AppImage -->
  <div id="tab-guide-appimage" class="install-guide-content" style="display:none;">
    <ol style="margin:0;padding-left:1.2rem;color:#cbd5e1;font-size:0.875rem;line-height:1.7;">
      <li>Click <strong>Download</strong> to get <code>dockmon-1.0.0.AppImage</code>.</li>
      <li>Make it executable and launch it:
        <div class="command-snippet-box" style="margin:0.5rem 0;background:#020617;">
          <span class="command-snippet-text font-mono" style="color:#38bdf8;">cd ~/Downloads && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage</span>
          <button class="copy-icon-btn" onclick="copyInstallCommand('cd ~/Downloads && chmod +x dockmon-1.0.0.AppImage && ./dockmon-1.0.0.AppImage', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          </button>
        </div>
      </li>
      <li><em>(Alternative GUI)</em>: Right click the file &rarr; <strong>Properties</strong> &rarr; <strong>Permissions</strong> &rarr; Check <em>"Allow executing file as program"</em> &rarr; Double click to run!</li>
    </ol>
  </div>

  <!-- Tab 3: Terminal Direct Install -->
  <div id="tab-guide-terminal" class="install-guide-content" style="display:none;">
    <p style="margin:0 0 0.5rem;font-size:0.875rem;color:#cbd5e1;">Prefer not using the browser? Download and install DockMon in a single command:</p>
    <div class="command-snippet-box" style="background:#020617;">
      <span class="command-snippet-text font-mono" style="color:#38bdf8;">curl -LO https://dockmon.zephyrus-labs.tech/downloads/dockmon-1.0.0.deb && sudo apt install ./dockmon-1.0.0.deb</span>
      <button class="copy-icon-btn" onclick="copyInstallCommand('curl -LO https://dockmon.zephyrus-labs.tech/downloads/dockmon-1.0.0.deb && sudo apt install ./dockmon-1.0.0.deb', this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      </button>
    </div>
  </div>

  <!-- Tab 4: Windows Setup -->
  <div id="tab-guide-windows" class="install-guide-content" style="display:none;">
    <ol style="margin:0;padding-left:1.2rem;color:#cbd5e1;font-size:0.875rem;line-height:1.7;">
      <li>Download <code>DockMon-Setup-1.0.0.exe</code>.</li>
      <li>Double-click the setup file to install. It will create Desktop and Start Menu shortcuts.</li>
      <li><em>SmartScreen Notice</em>: Since DockMon is open-source software, click <strong>"More info"</strong> &rarr; <strong>"Run anyway"</strong> if Windows SmartScreen displays a warning.</li>
    </ol>
  </div>
</div>
```

---

### Pattern C: JavaScript Tab Controller
Add this function to `public/os-detector.js` or in a `<script>` tag inside `public/index.html`:

```javascript
function switchInstallGuideTab(tabId, buttonEl) {
  // Hide all guide content panels
  document.querySelectorAll('.install-guide-content').forEach(panel => {
    panel.style.display = 'none';
  });

  // Remove active styling from all buttons in the tab group
  const tabContainer = buttonEl.parentElement;
  tabContainer.querySelectorAll('button').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderColor = '#334155';
    btn.style.color = '#94a3b8';
  });

  // Show active panel
  const activePanel = document.getElementById(tabId);
  if (activePanel) {
    activePanel.style.display = 'block';
  }

  // Highlight active button
  buttonEl.classList.add('active');
  buttonEl.style.borderColor = '#6366f1';
  buttonEl.style.color = '#ffffff';
}
```

---

## 4. Prompt for Any Future LLM or Frontend Developer

```text
Please read docs/ui_download_and_installation_guide.md.
Task:
1. Update public/index.html in /home/shubham/startups/vps_monitoring_spa.
2. Update the Debian/Ubuntu table row installation command to show "cd ~/Downloads && sudo apt install ./dockmon-1.0.0.deb".
3. Insert the "Quick Installation Guide" 4-tab card component under the downloads table.
4. Add the switchInstallGuideTab JS helper so users can easily toggle between Ubuntu (.deb), Universal AppImage, 1-Line Terminal command, and Windows setup.
```
