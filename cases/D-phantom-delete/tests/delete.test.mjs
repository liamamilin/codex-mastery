import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteRecord as brokenDelete } from '../starter/core.mjs';
import { deleteRecord as fixedDelete } from '../solution/core.mjs';
import { STORAGE_KEYS, SAMPLE_RECORDS, readRecords, saveRecords, restoreSamples, addRecord, validateLink } from '../shared/storage.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { writes.push(key); values.set(key, String(value)); },
    writes,
  };
}

test('starter deterministically reproduces UI-memory deletion followed by recovery on reload', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.starter;
  const records = restoreSamples(storage, key);
  const afterDelete = brokenDelete(storage, key, records, 'sample-1');
  assert.equal(afterDelete.some(({ id }) => id === 'sample-1'), false);
  assert.equal(storage.writes.length, 1, 'deletion did not write; only initial samples were saved');
  assert.equal(readRecords(storage, key).some(({ id }) => id === 'sample-1'), true);
  assert.notDeepEqual(afterDelete, readRecords(storage, key));
});

test('solution deletes durably while preserving neighbouring records', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  const records = restoreSamples(storage, key);
  const afterDelete = fixedDelete(storage, key, records, 'sample-1');
  assert.equal(storage.writes.length, 2);
  assert.deepEqual(readRecords(storage, key), afterDelete);
  assert.deepEqual(afterDelete.map(({ id }) => id), ['sample-2', 'sample-3']);
});

test('solution can remove every record; an empty array is not mistaken for uninitialized storage', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  let records = restoreSamples(storage, key);
  for (const record of SAMPLE_RECORDS) records = fixedDelete(storage, key, records, record.id);
  assert.deepEqual(records, []);
  assert.deepEqual(readRecords(storage, key), []);
  assert.notEqual(readRecords(storage, key), null);
});

test('add and reload remain correct after a successful deletion', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  let records = restoreSamples(storage, key);
  records = fixedDelete(storage, key, records, 'sample-1');
  records = addRecord(storage, key, records, '回归检查', 'https://example.com/check', 'new-1');
  assert.deepEqual(readRecords(storage, key), records);
  assert.equal(records.length, 3);
  assert.equal(records.some(({ id }) => id === 'sample-1'), false);
  assert.equal(records[0].title, '回归检查');
});

test('a failed persistence write does not mutate the input list or old saved data', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  const records = restoreSamples(storage, key);
  const original = structuredClone(records);
  const blocked = { getItem: storage.getItem, setItem() { throw new Error('QuotaExceededError'); } };
  assert.throws(() => fixedDelete(blocked, key, records, 'sample-1'), /QuotaExceededError/);
  assert.deepEqual(records, original);
  assert.deepEqual(readRecords(storage, key), original);
});

test('restoring samples touches only the current D key, preserving A and the other D version', () => {
  const aKey = 'codex-mastery:linkshelf:a1:v1';
  const storage = memoryStorage({ [aKey]: 'A data', [STORAGE_KEYS.solution]: 'other version data' });
  restoreSamples(storage, STORAGE_KEYS.starter);
  assert.equal(storage.getItem(aKey), 'A data');
  assert.equal(storage.getItem(STORAGE_KEYS.solution), 'other version data');
  assert.deepEqual(storage.writes, [STORAGE_KEYS.starter]);
  assert.throws(() => saveRecords(storage, aKey, []), /专用存储键/);
});

test('read rejects malformed data instead of overwriting it with samples', () => {
  for (const raw of ['{broken', JSON.stringify({ version: 2, records: [] }), JSON.stringify({ version: 1, records: [{ id: 'x', title: 'x', url: 'javascript:alert(1)' }] })]) {
    const storage = memoryStorage({ [STORAGE_KEYS.starter]: raw });
    assert.throws(() => readRecords(storage, STORAGE_KEYS.starter));
    assert.equal(storage.getItem(STORAGE_KEYS.starter), raw);
    assert.deepEqual(storage.writes, []);
  }
});

test('input validation rejects executable protocols and leaves saved data unchanged', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  const records = restoreSamples(storage, key);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///test', 'example.com']) {
    assert.throws(() => addRecord(storage, key, records, '错误地址', url, 'new-bad'));
  }
  assert.throws(() => validateLink('  ', 'https://example.com'));
  assert.deepEqual(readRecords(storage, key), records);
});

test('unknown ID deletion is harmless, and a valid title remains plain data', () => {
  const storage = memoryStorage();
  const key = STORAGE_KEYS.solution;
  const records = restoreSamples(storage, key);
  assert.deepEqual(fixedDelete(storage, key, records, 'not-found'), records);
  assert.deepEqual(validateLink(' <b>仅为文字</b> ', 'HTTPS://EXAMPLE.COM'), { title: '<b>仅为文字</b>', url: 'https://example.com/' });
});
