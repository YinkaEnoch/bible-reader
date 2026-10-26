install:
	adb install -r /home/thinkpad-t480s/CodeArena/App/bible-reader/android/app/build/outputs/apk/debug/app-debug.apk

uninstall:
	adb uninstall com.biblereader.app

disconnect:
	adb disconnect

build:
	npm run cap:sync
