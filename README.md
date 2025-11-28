# FlexAI Desktop

This is a standalone desktop launcher for FlexAI. It allows you to run the full FlexAI platform locally without needing Docker or manual configuration.

## How it works

1.  It finds the FlexAI executable (bundled or in the monorepo).
2.  It automatically configures the environment (Database, Port, Encryption Keys).
3.  It launches the FlexAI server in the background.
4.  It opens the FlexAI interface in the application window.

## Development

To run this launcher against your local FlexAI source code:

1.  Ensure you have built the main project:
    ```bash
    cd ../
    pnpm build
    ```
2.  Install dependencies here:
    ```bash
    npm install
    ```
3.  Start the desktop app:
    ```bash
    npm start
    ```

## Building for Distribution

To create a standalone installer that includes the FlexAI code:

1.  You must configure the build process to copy the `packages/cli` and `packages/editor-ui` build artifacts into the Electron resources.
2.  Run:
    ```bash
    npm run dist
    ```
