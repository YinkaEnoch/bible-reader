#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Bible Reader — Native Android APK Build Script
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Environment & Paths Configuration
export JAVA_HOME="${JAVA_HOME:-/home/thinkpad-t480s/.bubblewrap/jdk/jdk-17.0.11+9}"
export ANDROID_HOME="${ANDROID_HOME:-/home/thinkpad-t480s/.bubblewrap/android_sdk}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# Build variant (default: debug)
BUILD_VARIANT="debug"
GRADLE_TASK="assembleDebug"
DO_CLEAN=false

for arg in "$@"; do
  case "$arg" in
    --release)
      BUILD_VARIANT="release"
      GRADLE_TASK="assembleRelease"
      ;;
    --clean)
      DO_CLEAN=true
      ;;
    --help|-h)
      echo "Usage: ./build-apk.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --release   Build unsigned Release APK instead of Debug"
      echo "  --clean     Run gradle clean before assembling"
      echo "  --help, -h  Display this help message"
      exit 0
      ;;
  esac
done

# Verify prerequisites
if [ ! -d "$JAVA_HOME" ]; then
  echo "[-] ERROR: JAVA_HOME not found at '$JAVA_HOME'."
  exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
  echo "[-] ERROR: ANDROID_HOME not found at '$ANDROID_HOME'."
  exit 1
fi

# Extract app version from package.json
APP_VERSION=$(node -p "require('./package.json').version || '1.0.0'")

echo "===================================================================="
echo " Building Bible Reader Android APK (v${APP_VERSION} - ${BUILD_VARIANT})"
echo "===================================================================="
echo "Java Home:    $JAVA_HOME"
echo "Android Home: $ANDROID_HOME"
echo "Build Task:   $GRADLE_TASK"
echo "===================================================================="

# 2. Synchronize Version & Service Worker Cache
echo ""
echo "[1/4] Synchronizing package.json version to Service Worker & Gradle..."
npm run sync:version

# 3. Compile Production Web Bundle
echo ""
echo "[2/4] Building production web assets (TypeScript & Vite)..."
npm run build

# 4. Synchronize with Capacitor Android
echo ""
echo "[3/4] Syncing web assets to native Android container..."
npx cap sync android

# 5. Build Native APK with Gradle
echo ""
echo "[4/4] Compiling native APK with Gradle (${GRADLE_TASK})..."
cd android

if [ "$DO_CLEAN" = true ]; then
  echo "Cleaning previous gradle build artifacts..."
  ./gradlew clean
fi

./gradlew "$GRADLE_TASK"
cd ..

# 6. Locate Output APK and copy to root
if [ "$BUILD_VARIANT" = "debug" ]; then
  SRC_APK="android/app/build/outputs/apk/debug/app-debug.apk"
  DEST_APK="bible-reader-v${APP_VERSION}-debug.apk"
  ROOT_LINK="app-debug.apk"
else
  SRC_APK="android/app/build/outputs/apk/release/app-release-unsigned.apk"
  DEST_APK="bible-reader-v${APP_VERSION}-release-unsigned.apk"
  ROOT_LINK="app-release.apk"
fi

if [ -f "$SRC_APK" ]; then
  cp "$SRC_APK" "$DEST_APK"
  cp "$SRC_APK" "$ROOT_LINK"
  APK_SIZE=$(du -h "$DEST_APK" | cut -f1)

  echo ""
  echo "===================================================================="
  echo " BUILD SUCCESSFUL!"
  echo "===================================================================="
  echo "Version:   v${APP_VERSION}"
  echo "APK:       $DEST_APK ($APK_SIZE)"
  echo "Symlink:   $ROOT_LINK"
  echo "Location:  $SRC_APK"
  echo ""
  echo "To install on a connected Android phone/emulator:"
  echo "  adb install -r $DEST_APK"
  echo "===================================================================="
else
  echo "[-] ERROR: Output APK not found at $SRC_APK"
  exit 1
fi
