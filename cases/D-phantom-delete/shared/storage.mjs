export const STORAGE_KEYS = Object.freeze({
  starter: 'codex-mastery:phantom-delete:starter:v1',
  solution: 'codex-mastery:phantom-delete:solution:v1',
});

export const SAMPLE_RECORDS = Object.freeze([
  Object.freeze({ id: 'sample-1', title: '示例网站', url: 'https://example.com/' }),
  Object.freeze({ id: 'sample-2', title: '学习资料', url: 'https://example.org/learn' }),
  Object.freeze({ id: 'sample-3', title: '待整理的参考', url: 'https://example.net/reference' }),
]);

export function validateLink(title, url) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanUrl = typeof url === 'string' ? url.trim() : '';
  if (!cleanTitle || cleanTitle.length > 120) throw new Error('请填写 1—120 个字符的标题。');
  if (!cleanUrl || cleanUrl.length > 2048) throw new Error('请填写完整网址，长度不超过 2048 个字符。');
  let parsed;
  try { parsed = new URL(cleanUrl); } catch { throw new Error('请填写以 http:// 或 https:// 开头的完整网址。'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('只接受 http:// 或 https:// 网址。');
  return { title: cleanTitle, url: parsed.href };
}

function checkKey(key) {
  if (!Object.values(STORAGE_KEYS).includes(key)) throw new Error('只能访问本案例的专用存储键。');
}

function validateRecords(records) {
  if (!Array.isArray(records) || records.length > 1000) throw new Error('收藏数据格式异常，请先备份专用键，不要直接覆盖。');
  const ids = new Set();
  for (const record of records) {
    if (!record || typeof record.id !== 'string' || !record.id || ids.has(record.id)) throw new Error('收藏 ID 格式异常。');
    validateLink(record.title, record.url);
    ids.add(record.id);
  }
}

export function readRecords(storage, key) {
  checkKey(key);
  const raw = storage.getItem(key);
  if (raw === null) return null;
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('收藏数据无法解析。请先备份专用键，再调查原始值。'); }
  if (data?.version !== 1) throw new Error('收藏数据版本不符合本案例格式。');
  validateRecords(data.records);
  return data.records.map(({ id, title, url }) => ({ id, ...validateLink(title, url) }));
}

export function saveRecords(storage, key, records) {
  checkKey(key);
  validateRecords(records);
  storage.setItem(key, JSON.stringify({ version: 1, records }));
}

export function restoreSamples(storage, key) {
  const records = SAMPLE_RECORDS.map((record) => ({ ...record }));
  saveRecords(storage, key, records);
  return records;
}

export function addRecord(storage, key, records, title, url, id) {
  const next = [{ id, ...validateLink(title, url) }, ...records];
  saveRecords(storage, key, next);
  return next;
}
