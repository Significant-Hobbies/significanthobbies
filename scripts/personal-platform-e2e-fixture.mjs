import { createServer } from 'node:http';

const port = Number.parseInt(process.env.PERSONAL_PLATFORM_FIXTURE_PORT ?? '4010', 10);
const generatedAt = '2026-08-21T10:10:00.000Z';

const today = {
  generatedAt,
  source: 'personal-platform',
  summaries: [
    {
      domain: 'live',
      source: 'significant-hobbies-service',
      status: 'connected',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:00:00.000Z',
      latest: { title: 'See the northern lights', status: 'planned' },
    },
    {
      domain: 'journal',
      source: 'personal-platform',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:01:00.000Z',
      latest: { occurredOn: '2026-08-21' },
    },
    {
      domain: 'habits',
      source: 'personal-platform',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:02:00.000Z',
      latest: { name: 'Walk', status: 'completed' },
    },
    {
      domain: 'setline',
      source: 'personal-platform',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:03:00.000Z',
      latest: { title: 'Strength', minutes: 40 },
    },
    {
      domain: 'kith',
      source: 'personal-platform',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:04:00.000Z',
      latest: { personName: 'Rahul' },
    },
    {
      domain: 'anchor',
      source: 'personal-platform',
      activeCount: 1,
      lastUpdatedAt: '2026-08-21T10:05:00.000Z',
      latest: { title: 'Write', durationSeconds: 1800 },
    },
    {
      domain: 'calorie',
      source: 'calorie-service',
      status: 'connected',
      summary: {
        entryCount: 1,
        totals: { calories: 640, proteinG: 42 },
        lastUpdatedAt: '2026-08-21T10:06:00.000Z',
      },
    },
  ],
};

const events = {
  items: [
    {
      id: 'anchor-session-fixture',
      domain: 'anchor',
      eventType: 'anchor.session_recorded',
      occurredAt: '2026-08-21T10:05:00.000Z',
    },
    {
      id: 'kith-interaction-fixture',
      domain: 'kith',
      eventType: 'kith.interaction_recorded',
      occurredAt: '2026-08-21T10:04:00.000Z',
    },
  ],
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
  if (url.pathname === '/health') return json(response, 200, { status: 'ok' });

  if (!request.headers.authorization?.startsWith('Bearer ')) {
    return json(response, 401, { error: 'unauthorized' });
  }

  if (request.method === 'GET' && url.pathname === '/v1/life/today') {
    return json(response, 200, today);
  }
  if (request.method === 'GET' && url.pathname === '/v1/life/events') {
    return json(response, 200, events);
  }
  return json(response, 404, { error: 'not_found' });
});

server.listen(port, '127.0.0.1');

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}
