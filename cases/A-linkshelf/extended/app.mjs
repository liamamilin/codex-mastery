import { STORAGE_KEY, MAX_LINKS, MAX_IMPORT_BYTES, createLink, readLinks, writeLinks, filterLinks, exportLinks, parseImport, mergeImport } from './core.mjs';

const $ = (id) => document.getElementById(id);
const list = $('link-list');
const fields = [$('title'), $('url'), $('tags')];
let storage;
try { storage = window.localStorage; } catch { /* readLinks gives actionable feedback. */ }
const initial = readLinks(storage);
let links = initial.links;
let busy = false;
const makeId = () => globalThis.crypto?.randomUUID?.() || `link-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function announce(message) { clearError(); $('status').textContent = message; }
function error(message, field) {
  $('status').textContent = '';
  $('form-error').textContent = message;
  $('form-error').hidden = false;
  fields.forEach((input) => input.removeAttribute('aria-invalid'));
  if (field) { $(field).setAttribute('aria-invalid', 'true'); $(field).focus(); }
}
function clearError() { $('form-error').hidden = true; $('form-error').textContent = ''; fields.forEach((input) => input.removeAttribute('aria-invalid')); }
function controls() {
  $('save-button').disabled = busy || !initial.ok;
  $('import-button').disabled = busy || !initial.ok;
  $('import-button').textContent = busy ? '正在检查备份…' : '导入 JSON ↑';
  list.querySelectorAll('button').forEach((button) => { button.disabled = busy || !initial.ok; });
}
function persist(next) {
  const saved = writeLinks(storage, next);
  if (!saved.ok) { error(saved.error); return false; }
  links = next;
  clearError();
  return true;
}
function render() {
  const selected = $('tag-filter').value;
  const allTags = [...new Set(links.flatMap((link) => link.tags))].sort((a, b) => a.localeCompare(b));
  $('tag-filter').replaceChildren();
  for (const [value, text] of [['', '全部标签'], ['untagged', '无标签'], ...allTags.map((tag) => [`tag:${tag}`, tag])]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    $('tag-filter').append(option);
  }
  $('tag-filter').value = selected === 'untagged' || allTags.some((tag) => `tag:${tag}` === selected) ? selected : '';
  const visible = filterLinks(links, $('search').value, $('tag-filter').value);
  list.replaceChildren();
  for (const item of visible) {
    const row = document.createElement('li');
    row.className = 'link-card';
    const icon = document.createElement('span');
    icon.className = 'link-icon'; icon.textContent = '↗'; icon.setAttribute('aria-hidden', 'true');
    const info = document.createElement('div'); info.className = 'link-content';
    const anchor = document.createElement('a');
    anchor.href = item.url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; anchor.textContent = item.title;
    anchor.setAttribute('aria-label', `${item.title}（在新标签页打开）`);
    const address = document.createElement('span'); address.className = 'link-address'; address.textContent = item.url;
    info.append(anchor, address);
    if (item.tags.length) {
      const tags = document.createElement('div'); tags.className = 'record-tags';
      for (const tag of item.tags) { const badge = document.createElement('span'); badge.textContent = tag; tags.append(badge); }
      info.append(tags);
    }
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-button'; remove.textContent = '删除';
    remove.setAttribute('aria-label', `删除“${item.title}”`);
    remove.addEventListener('click', () => {
      if (busy || !initial.ok) return;
      if (persist(links.filter((link) => link.id !== item.id))) {
        render(); (list.querySelector('button') || $('title')).focus(); announce(`已删除“${item.title}”。`);
      }
    });
    row.append(icon, info, remove); list.append(row);
  }
  $('total-count').textContent = links.length;
  $('export-button').disabled = links.length === 0;
  $('empty-state').hidden = visible.length > 0;
  const filtering = Boolean($('search').value.trim() || $('tag-filter').value);
  $('filter-summary').hidden = !filtering;
  $('filter-summary').textContent = `找到 ${visible.length} 条，共 ${links.length} 条；关键词与标签同时匹配。`;
  $('empty-title').textContent = links.length && filtering ? '还没有找到匹配的链接。' : '一张空白的架子，等一个好链接。';
  $('empty-description').textContent = links.length && filtering ? '清空关键词或切回“全部标签”再试。' : '填入标题和网址保存，也可以导入已有 LinkShelf 备份。';
  controls();
}

$('link-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (busy || !initial.ok) return;
  clearError();
  if (links.length >= MAX_LINKS) { error(`最多 ${MAX_LINKS} 条，请先整理并备份。`); return; }
  const result = createLink($('title').value, $('url').value, $('tags').value, makeId());
  if (!result.ok) { error(result.error, result.field); return; }
  if (links.some((item) => item.url === result.link.url)) { error('已经收藏过这个标准化网址，保留原有标题与标签。', 'url'); return; }
  if (persist([result.link, ...links])) {
    $('link-form').reset(); $('search').value = ''; $('tag-filter').value = ''; render(); $('title').focus(); announce('已保存链接与标签。可以刷新检查。');
  }
});
$('search').addEventListener('input', () => { render(); announce(`找到 ${filterLinks(links, $('search').value, $('tag-filter').value).length} 条链接。`); });
$('tag-filter').addEventListener('change', () => { render(); announce(`找到 ${filterLinks(links, $('search').value, $('tag-filter').value).length} 条链接。`); });
$('export-button').addEventListener('click', () => {
  try {
    const url = URL.createObjectURL(new Blob([exportLinks(links)], { type: 'application/json;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `linkshelf-extended-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('已请求导出含标签的 JSON，请检查浏览器下载列表。');
  } catch { error('导出未完成，请检查浏览器下载权限。'); }
});
$('import-button').addEventListener('click', () => { if (!busy && initial.ok) $('import-file').click(); });
$('import-file').addEventListener('change', async () => {
  const file = $('import-file').files?.[0];
  if (!file || busy || !initial.ok) return;
  busy = true; clearError(); controls();
  try {
    if (file.size > MAX_IMPORT_BYTES) throw new Error('文件超过 16 MiB，没有读取或保存任何条目。');
    const parsed = parseImport(await file.text());
    if (!parsed.ok) throw new Error(parsed.error);
    const merged = mergeImport(links, parsed.links, makeId);
    if (!merged.ok) throw new Error(merged.error);
    if (persist(merged.links)) {
      $('search').value = ''; $('tag-filter').value = ''; render();
      announce(`导入完成：新增 ${merged.added} 条，跳过重复 ${merged.skipped} 条，当前共 ${merged.total} 条。已有标题与标签保持原样。`);
    }
  } catch (failure) { error(`导入未保存：${failure.message}`); }
  finally { busy = false; $('import-file').value = ''; controls(); $('import-button').focus(); }
});
if (!initial.ok) { $('storage-warning').hidden = false; $('storage-warning').textContent = `${initial.error} 专用键：${STORAGE_KEY}`; }
render();
