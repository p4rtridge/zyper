# Zyper

![logo128x128](https://github.com/user-attachments/assets/dbcda3e7-fd62-4057-8304-5fc86f5ed8bc)


> [!WARNING]
> THIS TOOL IS SO FAR A PET PROJECT FOR ME! USE IF YOU LIKE.

Simple typing tool that helps you type your translations faster by reducing the 'copy-paste' process on macOS, Windows and Linux (X11).

## Demo

https://github.com/user-attachments/assets/d0cf297b-df99-417c-94c7-54d985cccb0a

## Download

Read the [releases](https://github.com/p4rtridge/zyper/releases) notes.

## Supported Document Formats

- TXT

## Common issues

**1. Shortcuts not working on macOS**

Problem: Shortcut keys do not function properly on macOS.

Solution: Application needs to be granted access to the Accessibility API (i.e. if you're running your process inside Terminal.app, then Terminal.app needs to be added in System Preferences > Security & Privacy > Privacy > Accessibility). If the process is not granted access to the Accessibility API, macOS will silently ignore the application and will not trigger it. No error will be generated.

**2. Intercept Input Feature Cannot Intercept Keyboard Input**

Problem: The intercept input feature is unable to capture keyboard input, causing unexpected behavior.

Solution: Please run the application with Administrator privileges to ensure this feature works correctly. Note that this feature is currently unstable, so it may not work as expected.

**3. Application crash**

Problem: The application fails to launch.

Solution: Try clearing all application data, then reopen the app. If the issue still persists, try using a different installer (e.g., NSIS or MSI) or upgrade to a newer version.

## Build From Sources

This application is built on Tauri, Make sure you follow these prerequisites first:
- [Prerequisties](https://tauri.app/start/prerequisites) to build Tauri applications.

```console
$ cargo install create-tauri-app --locked
$ cd src-tauri
$ cargo tauri build
```

The installer will be located on release/bundle folder.
