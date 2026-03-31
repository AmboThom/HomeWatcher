import { createApp } from './app';
import { config } from './config';
import { testConnection } from './db';

async function start(): Promise<void> {
  // Verify DB is reachable before accepting traffic
  await testConnection();

  const app = createApp();

  app.listen(config.port, () => {
    console.log(
      `✓ Server running on http://localhost:${config.port} [${config.nodeEnv}]`
    );
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
