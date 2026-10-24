#!/usr/bin/env bash
# ==============================================================================
# DockMon Installer Script
# Brand: Zephyrus Labs (https://zephyrus-labs.tech/)
# Product: DockMon (https://dockmon.zephyrus-labs.tech/)
# Author: Shubham Sharma (https://github.com/uchiha-fire)
# License: MIT
# ==============================================================================

set -euo pipefail

VERSION="1.0.0"
BASE_URL="https://dockmon.zephyrus-labs.tech/downloads"

# Colors
C_RESET="\033[0m"
C_BOLD="\033[1m"
C_CYAN="\033[36m"
C_GREEN="\033[32m"
C_YELLOW="\033[33m"
C_RED="\033[31m"

echo -e "${C_CYAN}${C_BOLD}"
cat << "EOF"
  ____             _     __  __             
 |  _ \  ___   ___| | __|  \/  | ___  _ __  
 | | | |/ _ \ / __| |/ /| |\/| |/ _ \| '_ \ 
 | |_| | (_) | (__|   < | |  | | (_) | | | |
 |____/ \___/ \___|_|\_\|_|  |_|\___/|_| |_|
EOF
echo -e "${C_RESET}"
echo -e "${C_BOLD}DockMon v${VERSION} — Agentless Remote Docker & Compose Monitor${C_RESET}"
echo -e "Published by Zephyrus Labs &bull; Lead Developer: Shubham Sharma\n"

# Verify OS is Linux
OS="$(uname -s)"
if [ "$OS" != "Linux" ]; then
  echo -e "${C_RED}Error: This installer is intended for Linux systems.${C_RESET}"
  echo "For Windows, please download DockMon-Setup-${VERSION}.exe from https://dockmon.zephyrus-labs.tech/#downloads"
  exit 1
fi

# Verify Architecture
ARCH="$(uname -m)"
if [ "$ARCH" != "x86_64" ]; then
  echo -e "${C_YELLOW}Warning: Detected architecture '$ARCH'. DockMon is currently optimized for x86_64.${C_RESET}"
fi

# Detect Sudo requirement
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo -e "${C_RED}Error: Root or sudo privileges are required to install system packages.${C_RESET}"
    exit 1
  fi
fi

TEMP_DIR="$(mktemp -d -t dockmon-install-XXXXXX)"
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# 1. Debian / Ubuntu / Linux Mint (APT)
if command -v apt-get >/dev/null 2>&1; then
  DEB_FILE="dockmon-${VERSION}.deb"
  DEB_URL="${BASE_URL}/${DEB_FILE}"
  TARGET_PATH="${TEMP_DIR}/${DEB_FILE}"

  echo -e "${C_CYAN}==> Detected Debian/Ubuntu system.${C_RESET}"
  echo -e "${C_CYAN}==> Downloading ${DEB_FILE}...${C_RESET}"
  curl -fSL --progress-bar "$DEB_URL" -o "$TARGET_PATH"

  echo -e "${C_CYAN}==> Installing package via apt...${C_RESET}"
  $SUDO apt-get update -qq || true
  $SUDO apt-get install -y "$TARGET_PATH"

# 2. Fedora / RHEL / CentOS / Rocky Linux (DNF)
elif command -v dnf >/dev/null 2>&1; then
  RPM_FILE="dockmon-${VERSION}.rpm"
  RPM_URL="${BASE_URL}/${RPM_FILE}"
  TARGET_PATH="${TEMP_DIR}/${RPM_FILE}"

  echo -e "${C_CYAN}==> Detected Fedora/RHEL system.${C_RESET}"
  echo -e "${C_CYAN}==> Downloading ${RPM_FILE}...${C_RESET}"
  curl -fSL --progress-bar "$RPM_URL" -o "$TARGET_PATH"

  echo -e "${C_CYAN}==> Installing package via dnf...${C_RESET}"
  $SUDO dnf install -y "$TARGET_PATH"

# 3. Fallback: Universal AppImage for any other Linux distribution
else
  APPIMAGE_FILE="dockmon-${VERSION}.AppImage"
  APPIMAGE_URL="${BASE_URL}/${APPIMAGE_FILE}"
  INSTALL_DIR="${HOME}/.local/bin"
  TARGET_PATH="${INSTALL_DIR}/dockmon"

  echo -e "${C_CYAN}==> Installing Universal AppImage to ${TARGET_PATH}...${C_RESET}"
  mkdir -p "$INSTALL_DIR"
  curl -fSL --progress-bar "$APPIMAGE_URL" -o "$TARGET_PATH"
  chmod +x "$TARGET_PATH"

  if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo -e "${C_YELLOW}Note: Add ~/.local/bin to your PATH to run 'dockmon' from anywhere:${C_RESET}"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
  fi
fi

echo -e "\n${C_GREEN}${C_BOLD}✓ DockMon v${VERSION} installed successfully!${C_RESET}"
echo -e "You can launch DockMon anytime by running:"
echo -e "  ${C_CYAN}dockmon${C_RESET}"
echo -e "or by selecting ${C_BOLD}DockMon${C_RESET} in your desktop application launcher.\n"
