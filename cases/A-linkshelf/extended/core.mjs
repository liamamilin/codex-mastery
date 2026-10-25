export const STORAGE_KEY = 'codex-mastery:linkshelf:extended:v1';
export const MAX_LINKS = 2000;
export const MAX_IMPORT_RECORDS = MAX_LINKS;
export const MAX_IMPORT_BYTES = 16 * 1024 * 1024;
export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 24;

function tagsFrom(value) {
  const items = typeof value === 'string' ? value.split(/[,，]/).filter((tag) => tag.trim()) : value;
  if (!Array.isArray(items) || items.length > MAX_TAGS || items.some((tag) => typeof tag !== 'string' || !tag.trim() || tag.trim().length > MAX_TAG_LENGTH)) {
    throw new Error(`最多 ${MAX_TAGS} 个非空标签，每个不超过 ${MAX_TAG_LENGTH} 个字符。`);
  }
  return [...new Set(items.map((tag) => tag.trim()))];
}

export function validateDraft(title, url, tags = []) {
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const cleanUrl = typeof url === 'string' ? url.trim() : '';
  if (!cleanTitle || cleanTitle.length > 120) return { ok: false, field: 'title', error: '请填写 1—120 个字符的标题。' };
  try {
    if (!cleanUrl || cleanUrl.length > 2048) throw new Error('length');
    const parsed = new URL(cleanUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw new Error('protocol');
    let normalizedTags;
    try { normalizedTags = tagsFrom(tags); } catch (error) { return { ok: false, field: 'tags', error: error.message }; }
    return { ok: true, value: { title: cleanTitle, url: parsed.href, tags: normalizedTags } };
  } catch {
    return { ok: false, field: 'url', error: '请使用 http:// 或 https:// 开头的完整网址，长度不超过 2048 个字符。' };
  }
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record) || typeof record.id !== 'string' || !record.id || record.id.length > 160 || typeof record.createdAt !== 'string' || record.createdAt.length > 64 || !Number.isFinite(Date.parse(record.createdAt))) {
    throw new Error('记录需要有效的 id、title、url、createdAt 和可选 tags 数组。');
  }
  if (record.tags !== undefined && !Array.isArray(record.tags)) throw new Error('备份中的 tags 必须是数组。');
  const draft = validateDraft(record.title, record.url, record.tags ?? []);
  if (!draft.ok) throw new Error(draft.error);
  return { id: record.id, ...draft.value, createdAt: record.createdAt };
}

function normalizeRecords(records, limit = MAX_LINKS) {
  if (!Array.isArray(records) || records.length > limit) throw new Error(`记录必须是数组，且不超过 ${limit} 条。`);
  const normalized = records.map(normalizeRecord);
  const ids = new Set(normalized.map(({ id }) => id));
  if (ids.size !== normalized.length) throw new Error('记录 ID 重复，请先检查备份来源。');
  return normalized;
}

export function readLinks(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { ok: true, links: [] };
    const data = JSON.parse(raw);
    if (data?.version !== 1) throw new Error('version');
    return { ok: true, links: normalizeRecords(data.links) };
  } catch {
    return { ok: false, links: [], error: '无法读取增强版收藏。为避免覆盖原始数据，已暂停新增、删除与导入。请先备份本版本专用键，检查权限或数据格式后刷新。' };
  }
}

export function writeLinks(storage, links) {
  try {
    const normalized = normalizeRecords(links);
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, links: normalized }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `这次更改没有保存，原列表保持不变。请检查浏览器存储权限、可用空间或数据格式。${error?.message || ''}` };
  }
}

export function createLink(title, url, tags, id, createdAt = new Date().toISOString()) {
  const result = validateDraft(title, url, tags);
  if (!result.ok) return result;
  try { return { ok: true, link: normalizeRecord({ id, ...result.value, createdAt }) }; }
  catch (error) { return { ok: false, error: error.message }; }
}

export function filterLinks(links, query = '', tag = '') {
  const keyword = query.trim().toLocaleLowerCase();
  return links.filter((link) => {
    const tagMatch = !tag || (tag === 'untagged' ? link.tags.length === 0 : link.tags.includes(tag.slice(4)));
    return tagMatch && (!keyword || `${link.title} ${link.url} ${link.tags.join(' ')}`.toLocaleLowerCase().includes(keyword));
  });
}

export function exportLinks(links, exportedAt = new Date().toISOString()) {
  return JSON.stringify({ format: 'linkshelf', version: 1, exportedAt, links: normalizeRecords(links) }, null, 2);
}

export function parseImport(text) {
  try {
    if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error('文件超过 16 MiB 或不是文本。');
    const data = JSON.parse(text.replace(/^\uFEFF/, ''));
    if (data?.format !== 'linkshelf' || data.version !== 1) throw new Error('仅接受 format 为 linkshelf、version 为 1 的 JSON 备份。');
    return { ok: true, links: normalizeRecords(data.links, MAX_IMPORT_RECORDS) };
  } catch (error) {
    return { ok: false, error: `导入未开始：${error.message} 没有保存任何条目。` };
  }
}

export function mergeImport(existing, incoming, makeId, now = new Date().toISOString()) {
  try {
    const links = normalizeRecords(existing);
    const candidates = normalizeRecords(incoming, MAX_IMPORT_RECORDS);
    const urls = new Set(links.map(({ url }) => url));
    const ids = new Set(links.map(({ id }) => id));
    let added = 0;
    let skipped = 0;
    for (const item of candidates) {
      if (urls.has(item.url)) { skipped++; continue; }
      const id = makeId();
      if (typeof id !== 'string' || ids.has(id)) throw new Error('无法分配不重复的本地 ID，请重试。');
      links.push(normalizeRecord({ ...item, id, createdAt: item.createdAt || now }));
      ids.add(id);
      urls.add(item.url);
      added++;
    }
    if (links.length > MAX_LINKS) throw new Error(`合并后超过 ${MAX_LINKS} 条上限。`);
    return { ok: true, links, added, skipped, total: links.length };
  } catch (error) { return { ok: false, error: `导入没有保存：${error.message}` }; }
}
