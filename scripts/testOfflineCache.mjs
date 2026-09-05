import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
function harness(entries = new Map(), online = false) {
  const handlers = {}, writes = [];
  vm.runInNewContext(source, {
    URL, Response,
    self: { location: { origin: 'https://game.test' }, addEventListener: (type, fn) => handlers[type] = fn },
    caches: {
      match: async key => entries.get(typeof key === 'string' ? key : key.url),
      open: async () => ({ put: async (request, response) => writes.push([request.url, await response.text()]) }),
    },
    fetch: async () => { if (!online) throw new Error('offline'); return new Response('asset'); },
  });
  return {
    writes,
    async request(path, mode = 'cors') {
      let response;
      const pending = [];
      handlers.fetch({ request: { url: `https://game.test${path}`, method: 'GET', mode },
        respondWith: promise => response = promise, waitUntil: promise => pending.push(promise) });
      const result = await response;
      await Promise.all(pending);
      return result;
    },
  };
}
test('offline navigation gets shell, missing audio and JS never get HTML', async () => {
  const cache = harness(new Map([['/index.html', new Response('<html>game</html>')]]));
  assert.equal(await (await cache.request('/room/123', 'navigate')).text(), '<html>game</html>');
  for (const asset of ['/js/app.js', '/audio/song.mp3', '/cover.jpg']) {
    assert.equal((await cache.request(asset)).type, 'error');
  }
});
test('offline modules use their exact cache entry', async () => {
  const cache = harness(new Map([['https://game.test/js/app.js?v=2', new Response('export const ok = true;')]]));
  assert.equal(await (await cache.request('/js/app.js?v=2')).text(), 'export const ok = true;');
  assert.equal((await cache.request('/js/app.js?v=3')).type, 'error');
});
test('online JS and navigation are cached, audio is not cached as shell', async () => {
  const cache = harness(new Map(), true);
  await cache.request('/js/app.js?v=2');
  await cache.request('/room/123', 'navigate');
  await cache.request('/audio/song.mp3');
  assert.deepEqual(cache.writes.map(([url]) => url), ['https://game.test/js/app.js?v=2', 'https://game.test/room/123']);
});
