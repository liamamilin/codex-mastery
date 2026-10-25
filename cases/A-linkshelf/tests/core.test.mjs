import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, createLink, validateDraft, readLinks, writeLinks, filterLinks, exportLinks } from '../solution/core.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
}

const first = createLink('示例网站', 'https://example.com', 'first', '2026-10-25T00:00:00.000Z').link;
const second = createLink('学习资料', 'http://example.org/Guide', 'second', '2026-10-25T00:01:00.000Z').link;

test('empty storage starts with an empty collection and leaves other keys untouched', () => {
  const storage = memoryStorage({ 'another-app': 'important' });
  assert.deepEqual(readLinks(storage), { ok: true, links: [] });
  assert.equal(writeLinks(storage, [first]).ok, true);
  assert.equal(storage.getItem('another-app'), 'important');
});

test('add, reload, delete, reload preserves the deletion, including the final item', () => {
  const storage = memoryStorage();
  assert.equal(writeLinks(storage, [first, second]).ok, true);
  const afterReload = readLinks(storage);
  assert.deepEqual(afterReload.links, [first, second]);
  assert.equal(writeLinks(storage, afterReload.links.filter(({ id }) => id !== first.id)).ok, true);
  assert.deepEqual(readLinks(storage).links, [second]);
  assert.equal(writeLinks(storage, []).ok, true);
  assert.deepEqual(readLinks(storage).links, []);
});

test('valid input is trimmed and URL is normalized without changing the title to markup', () => {
  assert.deepEqual(validateDraft('  <b>学习</b>  ', ' HTTPS://EXAMPLE.COM/a?q=1#part '), {
    ok: true, value: { title: '<b>学习</b>', url: 'https://example.com/a?q=1#part' },
  });
});

test('blank or oversized titles and malformed or executable URLs are rejected', () => {
  for (const [title, url] of [
    ['', 'https://example.com'], ['   ', 'https://example.com'], ['a'.repeat(121), 'https://example.com'],
    ['错误', 'example.com'], ['错误', 'https://'], ['错误', 'javascript:alert(1)'],
    ['错误', 'data:text/html,<script>alert(1)</script>'], ['错误', 'file:///etc/passwd'],
    ['错误', 'ftp://example.com'], ['错误', `https://example.com/${'a'.repeat(2048)}`],
  ]) {
    assert.equal(validateDraft(title, url).ok, false, `${title.slice(0, 10)} / ${url.slice(0, 40)}`);
  }
});

test('read fails explicitly for corrupt data without deleting or rewriting it', () => {
  for (const raw of ['{invalid', JSON.stringify({ version: 2, links: [] }), JSON.stringify({ version: 1, links: [{ ...first, url: 'javascript:alert(1)' }] })]) {
    const storage = memoryStorage({ [STORAGE_KEY]: raw });
    const result = readLinks(storage);
    assert.equal(result.ok, false);
    assert.deepEqual(result.links, []);
    assert.ok(result.error.includes('暂停'));
    assert.equal(storage.getItem(STORAGE_KEY), raw);
  }
});

test('read rejects duplicate IDs so a delete cannot remove multiple hidden duplicates', () => {
  const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ version: 1, links: [first, { ...second, id: first.id }] }) });
  assert.equal(readLinks(storage).ok, false);
});

test('blocked storage reports read and write failures instead of claiming persistence', () => {
  const storage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
  };
  assert.equal(readLinks(storage).ok, false);
  const links = [first];
  const before = structuredClone(links);
  const result = writeLinks(storage, links);
  assert.equal(result.ok, false);
  assert.ok(result.error.includes('没有保存'));
  assert.deepEqual(links, before);
});

test('invalid records cannot overwrite already saved data', () => {
  const storage = memoryStorage();
  writeLinks(storage, [first]);
  assert.equal(writeLinks(storage, [{ ...first, title: '' }]).ok, false);
  assert.deepEqual(readLinks(storage).links, [first]);
});

test('search matches title or URL without modifying saved records', () => {
  const links = [first, second];
  assert.deepEqual(filterLinks(links, '学习'), [second]);
  assert.deepEqual(filterLinks(links, '  GUIDE '), [second]);
  assert.deepEqual(filterLinks(links, 'not-found'), []);
  assert.equal(filterLinks(links, '  '), links);
  assert.deepEqual(links, [first, second]);
});

test('export is readable versioned JSON and retains original record IDs and data', () => {
  const result = JSON.parse(exportLinks([first, second], '2026-10-25T01:00:00.000Z'));
  assert.deepEqual(result, { format: 'linkshelf', version: 1, exportedAt: '2026-10-25T01:00:00.000Z', links: [first, second] });
});
