import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, MAX_IMPORT_BYTES, MAX_IMPORT_RECORDS, MAX_LINKS, createLink, readLinks, writeLinks, filterLinks, exportLinks, parseImport, mergeImport } from '../extended/core.mjs';

const one = createLink('学习资料', 'https://example.com', ['学习', '文档'], 'local-1', '2026-10-26T00:00:00Z').link;
const two = createLink('参考资料', 'https://example.org/reference', ['参考'], 'local-2', '2026-10-26T00:01:00Z').link;
const plain = createLink('无标签样本', 'http://example.net', [], 'local-3', '2026-10-26T00:02:00Z').link;
const backup = (links) => JSON.stringify({ format: 'linkshelf', version: 1, links });
const memory = (initial = {}) => {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) };
};

test('extended records persist tags, support deletion and never touch the basic app key', () => {
  const basicKey = 'codex-mastery:linkshelf:a1:v1';
  const storage = memory({ [basicKey]: 'keep original data' });
  assert.equal(writeLinks(storage, [one, two]).ok, true);
  assert.deepEqual(readLinks(storage).links, [one, two]);
  assert.equal(writeLinks(storage, [two]).ok, true);
  assert.deepEqual(readLinks(storage).links, [two]);
  assert.equal(storage.getItem(basicKey), 'keep original data');
  assert.notEqual(STORAGE_KEY, basicKey);
});

test('optional tags normalize comma-separated input and reject invalid tags or unsafe URLs', () => {
  assert.deepEqual(createLink('标题', 'https://example.com', ' 学习，文档,学习 ', 'new').link.tags, ['学习', '文档']);
  assert.deepEqual(createLink('标题', 'https://example.com', '', 'new').link.tags, []);
  for (const tags of [Array(6).fill('学习'), ['x'.repeat(25)], [''], [1]]) assert.equal(createLink('标题', 'https://example.com', tags, 'new').ok, false);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///a', 'example.com']) assert.equal(createLink('标题', url, [], 'new').ok, false);
});

test('keyword and tag filters intersect and untagged records are observable', () => {
  const links = [one, two, plain];
  assert.deepEqual(filterLinks(links, '资料', 'tag:学习'), [one]);
  assert.deepEqual(filterLinks(links, 'example.org', 'tag:学习'), []);
  assert.deepEqual(filterLinks(links, '', 'untagged'), [plain]);
  assert.deepEqual(filterLinks(links, '文档'), [one]);
  assert.deepEqual(filterLinks(links, ''), links);
});

test('basic version-1 backup imports without tags, extended export retains tags', () => {
  const { tags, ...basicRecord } = one;
  const parsed = parseImport(backup([basicRecord]));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.links[0].tags, []);
  assert.deepEqual(parseImport(exportLinks([one, two])).links, [one, two]);
});

test('merge skips normalized duplicate URLs, keeps existing metadata and replaces incoming IDs', () => {
  const incoming = [
    { ...one, id: 'backup-1', title: '不应覆盖原标题', tags: ['新标签'], url: 'HTTPS://EXAMPLE.COM:443/' },
    { ...two, id: 'backup-2' },
    { ...two, id: 'backup-3' },
  ];
  const original = structuredClone([one]);
  const result = mergeImport([one], incoming, () => 'new-id');
  assert.equal(result.ok, true);
  assert.deepEqual([result.added, result.skipped, result.total], [1, 2, 2]);
  assert.deepEqual(result.links[0], one);
  assert.equal(result.links[1].id, 'new-id');
  assert.deepEqual([one], original);
});

test('invalid structure, unsafe records and duplicate IDs reject the entire import', () => {
  const invalid = ['not-json', '{}', JSON.stringify({ format: 'linkshelf', version: 2, links: [] }),
    backup([one, { ...two, url: 'javascript:alert(1)' }]), backup([one, { ...two, tags: 'not-array' }]),
    backup([one, { ...two, createdAt: 'bad-date' }]), backup([one, { ...two, id: one.id }]), backup([null])];
  for (const text of invalid) assert.equal(parseImport(text).ok, false, text);
  assert.deepEqual(one.tags, ['学习', '文档']);
});

test('import byte and record limits are enforced before saving', () => {
  assert.equal(parseImport(' '.repeat(MAX_IMPORT_BYTES + 1)).ok, false);
  const many = Array.from({ length: MAX_IMPORT_RECORDS + 1 }, (_, index) => ({ ...one, id: `backup-${index}` }));
  assert.equal(parseImport(backup(many)).ok, false);
});

test('merged collection cap and ID collision fail without modifying the current collection', () => {
  const existing = Array.from({ length: MAX_LINKS }, (_, index) => ({ ...one, id: `local-${index}`, url: `https://example.com/${index}` }));
  assert.equal(mergeImport(existing, [two], () => 'incoming').ok, false);
  assert.equal(existing.length, MAX_LINKS);
  assert.equal(mergeImport([one], [two], () => one.id).ok, false);
});

test('failed writes and malformed existing storage leave old data untouched', () => {
  const storage = memory();
  writeLinks(storage, [one]);
  const raw = storage.getItem(STORAGE_KEY);
  const blocked = { getItem: storage.getItem, setItem() { throw new Error('QuotaExceededError'); } };
  const plan = mergeImport([one], [two], () => 'new');
  assert.equal(writeLinks(blocked, plan.links).ok, false);
  assert.equal(storage.getItem(STORAGE_KEY), raw);
  const damaged = memory({ [STORAGE_KEY]: '{broken' });
  assert.equal(readLinks(damaged).ok, false);
  assert.equal(damaged.getItem(STORAGE_KEY), '{broken');
});
