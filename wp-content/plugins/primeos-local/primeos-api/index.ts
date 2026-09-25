import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { handleAgentSubmit, handlePrimeOSApi } from './router.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'primeos-api' });
  });

  app.use(async (request: Request, response: Response, next: NextFunction) => {
    if (request.path !== '/agent/submit' && !request.path.startsWith('/api/entities/')) {
      next();
      return;
    }

    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(request.headers)) {
        if (typeof value === 'string') headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(', '));
      }

      const init: RequestInit = { method: request.method, headers };
      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body !== undefined) {
        init.body = JSON.stringify(request.body);
      }

      const fetchRequest = new globalThis.Request(
        `${request.protocol}://${request.get('host')}${request.originalUrl}`,
        init,
      );
      const fetchResponse = request.path === '/agent/submit'
        ? await handleAgentSubmit(fetchRequest)
        : await handlePrimeOSApi(fetchRequest);
      if (!fetchResponse) {
        next();
        return;
      }

      fetchResponse.headers.forEach((value, key) => response.setHeader(key, value));
      response.status(fetchResponse.status).send(await fetchResponse.text());
    } catch (error) {
      next(error);
    }
  });

  return app;
}

export function startServer(port = Number(process.env.PORT) || 3000) {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`PrimeOS API listening on port ${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}