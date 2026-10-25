// Pure data operations: reusable in the browser and Node's built-in test runner.
export const STORAGE_KEY = 'codex-mastery:linkshelf:a1:v1';
export const MAX_LINKS = 2000;

export function validateDraft(title, url) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanUrl = typeof url === 'string' ? url.trim() : '';
  if (!cleanTitle) return { ok: false, field: 'title', error: '先给这条链接取一个标题。' };
  if (cleanTitle.length > 120) return { ok: false, field: 'title', error: '标题请控制在 120 个字符以内。' };
  if (!cleanUrl || cleanUrl.length > 2048) return { ok: false, field: 'url', error: '请填写完整网址，长度不超过 2048 个字符。' };
  try {
    const parsed = new URL(cleanUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('protocol');
    return { ok: true, value: { title: cleanTitle, url: parsed.href } };
  } catch {
    return { ok: false, field: 'url', error: '网址格式不正确。请使用 http:// 或 https:// 开头的完整地址，例如 https://example.com。' };
  }
}

function isRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return false;
  if (typeof record.id !== 'string' || !record.id || record.id.length > 160) return false;
  if (typeof record.createdAt !== 'string' || !Number.isFinite(Date.parse(record.createdAt))) return false;
  return validateDraft(record.title, record.url).ok;
}

export function validateRecords(records) {
  if (!Array.isArray(records) || records.length > MAX_LINKS) return false;
  const ids = new Set();
  for (const record of records) {
    if (!isRecord(record) || ids.has(record.id)) return false;
    ids.add(record.id);
  }
  return true;
}

export function readLinks(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { ok: true, links: [] };
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !validateRecords(data.links)) throw new Error('invalid data');
    // Keep only the documented fields, and normalize URLs again before rendering.
    return { ok: true, links: data.links.map(({ id, title, url, createdAt }) => ({ id, ...validateDraft(title, url).value, createdAt })) };
  } catch {
    return { ok: false, links: [], error: '无法读取当前浏览器的收藏，可能是存储权限受限或数据格式异常。为避免覆盖已有数据，已暂停新增和删除。请先备份站点存储并检查浏览器设置，再刷新重试。' };
  }
}

export function writeLinks(storage, links) {
  if (!validateRecords(links)) return { ok: false, error: '收藏数据格式异常，未保存任何更改。' };
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, links }));
    return { ok: true };
  } catch {
    return { ok: false, error: '这次更改没有保存，列表保持原样。浏览器可能禁止了站点存储，或可用空间不足。请检查存储设置后重试；已有收藏可先导出备份。' };
  }
}

export function createLink(title, url, id, createdAt = new Date().toISOString()) {
  const result = validateDraft(title, url);
  if (!result.ok) return result;
  const link = { id, ...result.value, createdAt };
  return isRecord(link) ? { ok: true, link } : { ok: false, error: '无法创建收藏记录，请刷新后重试。' };
}

export function filterLinks(links, query) {
  const keyword = query.trim().toLocaleLowerCase();
  return keyword ? links.filter(({ title, url }) => `${title} ${url}`.toLocaleLowerCase().includes(keyword)) : links;
}

export function exportLinks(links, exportedAt = new Date().toISOString()) {
  if (!validateRecords(links)) throw new Error('Invalid LinkShelf records');
  return JSON.stringify({ format: 'linkshelf', version: 1, exportedAt, links }, null, 2);
}
