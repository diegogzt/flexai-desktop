# FlexAI Desktop

This repository contains the complete FlexAI platform wrapped in a desktop launcher. It allows users to run FlexAI locally without Docker or complex setup.

## Structure

- `server/`: Contains the full source code of FlexAI (backend & frontend).
- `main.js`: The Electron entry point that launches the server and opens the UI.

## Development

1.  Install dependencies (this will also install and build the inner FlexAI server):
    ```bash
    npm install
    ```
    *Note: This may take a while as it builds the entire platform.*

2.  Start the desktop app:
    ```bash
    npm start
    ```

## Building for Distribution

To create a standalone installer:

```bash
npm run dist
```

The installer will include the compiled FlexAI server, so the end user does not need Node.js or Docker installed.
