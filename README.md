# FlexAI Desktop Manager

This is an Electron-based desktop application that manages the FlexAI Docker container. It provides a simple GUI to install, start, stop, and update FlexAI.

## Prerequisites

- **Docker Desktop** (or Docker Engine) must be installed and running on the host machine.
- **Node.js** and **npm/pnpm** for building the application.

## Development

1. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start the application in development mode:
   ```bash
   npm start
   ```

## Building for Distribution

To build the installer for your current platform (Windows, macOS, or Linux):

```bash
npm run dist
```

The output files (installers) will be in the `dist` directory.

## How it works

- The app uses `dockerode` to communicate with the local Docker daemon.
- It manages a container named `flexai` using the image `diegogzt/flexai:latest`.
- It maps port `5678` and mounts a volume `flexai_data` for persistence.
