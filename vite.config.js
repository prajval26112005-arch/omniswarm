import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vendor-guardian-backend-proxy',
      configureServer(server) {
        server.middlewares.use('/api/check-vendor-status', async (req, res) => {
          if (req.method !== 'GET' && req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
            return;
          }

          let targetUrl = 'https://vendor-guardian-bot.lovable.app';
          try {
            const host = req.headers.host || 'localhost:5173';
            const parsedUrl = new URL(req.url, `http://${host}`);
            const queryUrl = parsedUrl.searchParams.get('url');
            if (queryUrl) {
              targetUrl = queryUrl;
            }
          } catch (e) {
            // fallback to default
          }

          const start = performance.now();
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            const response = await fetch(targetUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'OmniSwarm-VendorGuardian/1.0'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            const responseTimeMs = Math.round(performance.now() - start);

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(
              JSON.stringify({
                reachable: true,
                status: response.status,
                statusText: response.statusText || 'OK',
                responseTimeMs,
                targetUrl
              })
            );
          } catch (err) {
            const responseTimeMs = Math.round(performance.now() - start);
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(
              JSON.stringify({
                reachable: false,
                status: null,
                reason:
                  err.name === 'AbortError'
                    ? 'Connection timed out (7s)'
                    : err.message || 'Host unreachable',
                responseTimeMs,
                targetUrl
              })
            );
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
