import { MAX_LINKS, createLink, readLinks, writeLinks, filterLinks, exportLinks } from './core.mjs';

const $ = (id) => document.getElementById(id);
const form = $('link-form');
const titleInput = $('title');
const urlInput = $('url');
const searchInput = $('search');
const errorBox = $('form-error');
const list = $('link-list');
const status = $('status');
let storage;
try { storage = window.localStorage; } catch { /* readLinks reports the failure. */ }
const loaded = readLinks(storage);
let links = loaded.links;
let messageTimer;

function announce(message) {
  clearTimeout(messageTimer);
  status.textContent = '';
  messageTimer = setTimeout(() => { status.textContent = message; }, 30);
}

function showError(message, field) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  titleInput.removeAttribute('aria-invalid');
  urlInput.removeAttribute('aria-invalid');
  if (field) {
    $(field).setAttribute('aria-invalid', 'true');
    $(field).focus();
  }
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  titleInput.removeAttribute('aria-invalid');
  urlInput.removeAttribute('aria-invalid');
}

function persist(nextLinks) {
  const result = writeLinks(storage, nextLinks);
  if (!result.ok) { showError(result.error); return false; }
  links = nextLinks;
  clearError();
  render();
  return true;
}

function removeLink(id) {
  const index = links.findIndex((link) => link.id === id);
  if (index < 0) return;
  const removed = links[index];
  if (persist(links.filter((link) => link.id !== id))) {
    const nextButton = list.querySelector('button');
    (nextButton || titleInput).focus();
    announce(`已删除“${removed.title}”。刷新页面后也不会恢复。`);
  }
}

function render() {
  const visible = filterLinks(links, searchInput.value);
  list.replaceChildren();
  for (const item of visible) {
    const row = document.createElement('li');
    row.className = 'link-card';
    const icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.textContent = '↗';
    icon.setAttribute('aria-hidden', 'true');
    const content = document.createElement('div');
    content.className = 'link-content';
    const anchor = document.createElement('a');
    anchor.href = item.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = item.title;
    anchor.setAttribute('aria-label', `${item.title}（在新标签页打开）`);
    const address = document.createElement('span');
    address.className = 'link-address';
    address.textContent = item.url;
    content.append(anchor, address);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'delete-button';
    button.textContent = '删除';
    button.disabled = !loaded.ok;
    button.setAttribute('aria-label', `删除“${item.title}”`);
    button.addEventListener('click', () => removeLink(item.id));
    row.append(icon, content, button);
    list.append(row);
  }
  $('total-count').textContent = links.length;
  $('export-button').disabled = links.length === 0;
  $('empty-state').hidden = visible.length > 0;
  const filtering = Boolean(searchInput.value.trim());
  $('filter-summary').hidden = !filtering;
  $('filter-summary').textContent = `找到 ${visible.length} 条，共 ${links.length} 条收藏。清空搜索可查看全部。`;
  $('empty-title').textContent = links.length && filtering ? '还没有找到匹配的链接。' : '一张空白的架子，等一个好链接。';
  $('empty-description').textContent = links.length && filtering ? '试试更短的关键词，或清空搜索查看全部收藏。' : '在表单中填入标题和网址，保存你的第一条收藏。';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!loaded.ok) return;
  clearError();
  if (links.length >= MAX_LINKS) { showError(`当前案例最多保存 ${MAX_LINKS} 条链接。请先导出备份，再整理收藏。`); return; }
  const id = globalThis.crypto?.randomUUID?.() || `link-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const result = createLink(titleInput.value, urlInput.value, id);
  if (!result.ok) { showError(result.error, result.field); return; }
  if (persist([result.link, ...links])) {
    form.reset();
    // Show the result even if an earlier search would hide the new entry.
    searchInput.value = '';
    render();
    titleInput.focus();
    announce(`已保存“${result.link.title}”。可以刷新页面检查它是否仍在。`);
  }
});

searchInput.addEventListener('input', () => { render(); announce(`找到 ${filterLinks(links, searchInput.value).length} 条链接。`); });

$('export-button').addEventListener('click', () => {
  try {
    const blob = new Blob([exportLinks(links)], { type: 'application/json;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const download = document.createElement('a');
    download.href = objectUrl;
    download.download = `linkshelf-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    announce('已请求导出 JSON，请检查浏览器下载列表。此阶段没有导入功能。');
  } catch {
    announce('导出未完成。请检查浏览器是否允许下载，再重试。');
  }
});

if (!loaded.ok) {
  $('storage-warning').textContent = loaded.error;
  $('storage-warning').hidden = false;
  $('save-button').disabled = true;
}
render();
