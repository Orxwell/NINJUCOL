// Import the Application
import app, {
  app_config,
} from './app.mjs';

// Importers for the server
import importer from '#importers/handler.importer.mjs';

import CLI from './CLI.mjs';


// Turning on the server, at PORT
const server = app.listen(importer.env.SERVER_PORT, () => {
  if (importer.env.SERVER_MODE === 'dev') {
    console.info(`[Server] listen on port: ${importer.env.SERVER_PORT}`);

    console.info(`[Server] URL: ${importer.env.SERVER_URL}\n`);
  }
});

// Initialize CLI...
const cli = new CLI({
  server    : server,
  app_config: app_config,
});

cli.start();

// Handle process signals
function handleSignal() {
  cli.close();

  shutdown().catch(error => {
    console.error('[Server] Shutdown:', error);
    process.exitCode = 1;
  });
}

process.once('SIGINT', handleSignal);
process.once('SIGTERM', handleSignal);
