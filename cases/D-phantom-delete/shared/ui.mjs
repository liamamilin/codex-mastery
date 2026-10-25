import { STORAGE_KEYS, readRecords, restoreSamples, addRecord } from './storage.mjs';

export function mountLab({ mode, deleteRecord }) {
  const fixed = mode === 'solution';
  const key = STORAGE_KEYS[mode];
  // This template is static. Every value from user input or storage is rendered
  // below with textContent, never inserted as HTML.
  document.getElementById('app').innerHTML = `
    <div class="shell">
      <header><a class="brand" href="./"><span class="brand-symbol" aria-hidden="true">↻</span> Phantom Delete<span class="brand-dot">.</span></a><span class="lab-label">CODEX MASTERY LAB <b>/ D</b></span></header>
      <main>
        <div class="hero"><div><p class="eyebrow">DEBUG THE CAUSE. KEEP THE EVIDENCE.</p><h1>消失的链接，<br /><em>为何又回来了？</em></h1><p class="intro">一次点击，两份状态。沿着数据流，找到真正缺少的那一步。</p></div><div class="path-art" aria-hidden="true"><span>点击删除</span><i>↓</i><span>当前列表</span><i>↓</i><span class="art-question">持久化存储 <b>?</b></span></div></div>
        <div id="mode-banner" class="mode-banner"><strong id="mode-title"></strong><span id="mode-description"></span></div>
        <div id="error" class="error" role="alert" hidden></div>
        <section class="lab-grid" aria-label="删除与持久化实验">
          <div class="panel list-panel"><div class="panel-heading"><div><span class="step">01 / OPERATE</span><h2>操作样本链接 <span id="count" class="count">0</span></h2></div><button id="reset" class="button secondary" type="button">恢复初始样本</button></div>
            <p class="panel-intro">先删除“示例网站”，检查状态，再使用浏览器刷新。</p>
            <ul id="records" class="records" aria-label="本案例的链接收藏"></ul>
            <p id="empty" class="empty" hidden>当前列表为空。先检查存储，再刷新，观察空状态能否保留。</p>
            <form id="add-form" novalidate><h3>追加一个检查样本</h3><div class="fields"><div><label for="title">标题</label><input id="title" name="title" maxlength="120" placeholder="例如：回归检查" required /></div><div><label for="url">网页地址</label><input id="url" name="url" type="url" maxlength="2048" placeholder="https://example.com" required spellcheck="false" /></div></div><button id="add" class="button primary" type="submit">保存样本链接 <span aria-hidden="true">↗</span></button></form>
          </div>
          <aside class="panel evidence-panel" aria-labelledby="evidence-title"><div class="panel-heading"><div><span class="step">02 / OBSERVE</span><h2 id="evidence-title">把两份状态放在一起</h2></div></div><p class="panel-intro">这里重新读取当前专用存储，和本页内存进行对照；不是模拟终端。</p><button id="inspect" class="button inspect" type="button">检查内存与存储 <span aria-hidden="true">↗</span></button><div class="snapshot"><div><span>当前页面的内存</span><b id="memory-count">—</b></div><pre id="memory-list" aria-label="当前内存中的记录"></pre></div><div class="snapshot"><div><span>localStorage 再次读取</span><b id="stored-count">—</b></div><pre id="stored-list" aria-label="重新从本地存储读取的记录"></pre></div><p id="comparison" class="comparison" role="status" aria-live="polite"></p><details><summary>查看本次页面的观察轨迹</summary><ol id="trace" class="trace"></ol></details></aside>
        </section>
        <p id="status" class="status" role="status" aria-live="polite" aria-atomic="true"></p>
        <section class="method"><span class="step">03 / EXPLAIN</span><p>先观察 → 对照内存与存储 → 定位读写路径 → 最小修复 → 刷新与邻近回归。</p><p>“恢复初始样本”只覆盖当前版本专用键中的练习数据，不接触 LinkShelf 或本案例另一版本的数据。</p></section>
        <details class="storage-details"><summary>数据保存在哪里？</summary><p>当前版本的专用键：<code id="storage-key"></code>。只保存在当前浏览器与来源（协议、主机、端口），不跨设备同步。清理站点数据会丢失。请仅使用合成练习链接。</p></details>
      </main><footer><span>A DELIBERATE BUG. A REAL INVESTIGATION.</span><span>浏览器本地实验 · 不运行 Codex 服务</span></footer>
    </div>`;
  const $ = (id) => document.getElementById(id);
  $('mode-title').textContent = fixed ? '参考修复版' : '教学故障版 · 故意保留删除缺陷';
  $('mode-description').textContent = fixed ? '用同样动作检查：删除后的状态是否真正保存，刷新后是否仍然成立。' : '这不是生产工具。故障来自真实执行的本地代码；调查前先记录现象，不要急着猜补丁。';
  $('mode-banner').classList.toggle('fixed', fixed);
  $('storage-key').textContent = key;
  let storage;
  let records = [];
  let healthy = false;
  let traceNumber = 0;

  function fail(error) {
    $('error').textContent = `本次操作未完成：${error?.message || '浏览器存储不可用'}。请保留观察结果，检查权限或专用键数据；不要清空整个站点存储。`;
    $('error').hidden = false;
  }

  function clearError() { $('error').hidden = true; }

  function inspect(label = '手动检查') {
    try {
      const stored = readRecords(storage, key) || [];
      const display = (items) => items.length ? items.map(({ id, title }) => `${id}  ${title}`).join('\n') : '（空）';
      $('memory-count').textContent = `${records.length} 条`;
      $('stored-count').textContent = `${stored.length} 条`;
      $('memory-list').textContent = display(records);
      $('stored-list').textContent = display(stored);
      const same = JSON.stringify(records) === JSON.stringify(stored);
      $('comparison').textContent = same ? '两份状态一致。仍需刷新检查重新载入的结果。' : '两份状态不同。刷新会重新读取存储中的那份记录。';
      $('comparison').classList.toggle('different', !same);
      const event = document.createElement('li');
      event.textContent = `${++traceNumber}. ${label}：内存 ${records.length} 条；存储 ${stored.length} 条；${same ? '一致' : '不同'}。`;
      $('trace').prepend(event);
      while ($('trace').children.length > 10) $('trace').lastElementChild.remove();
    } catch (error) { fail(error); }
  }

  function render() {
    $('records').replaceChildren();
    for (const record of records) {
      const row = document.createElement('li');
      const icon = document.createElement('span');
      icon.className = 'link-icon';
      icon.textContent = '↗';
      icon.setAttribute('aria-hidden', 'true');
      const info = document.createElement('div');
      info.className = 'link-info';
      const title = document.createElement('a');
      title.textContent = record.title;
      title.href = record.url;
      title.target = '_blank';
      title.rel = 'noopener noreferrer';
      title.setAttribute('aria-label', `${record.title}（在新标签页打开）`);
      const address = document.createElement('span');
      address.textContent = record.url;
      info.append(title, address);
      const remove = document.createElement('button');
      remove.className = 'remove';
      remove.type = 'button';
      remove.textContent = '删除';
      remove.setAttribute('aria-label', `删除“${record.title}”`);
      remove.addEventListener('click', () => {
        try {
          records = deleteRecord(storage, key, records, record.id);
          clearError();
          render();
          inspect(`点击删除“${record.title}”`);
          $('status').textContent = '当前列表已更新。请查看右侧对照，并用浏览器刷新检验。';
          ($('records').querySelector('button') || $('title')).focus();
        } catch (error) { fail(error); }
      });
      row.append(icon, info, remove);
      $('records').append(row);
    }
    $('count').textContent = records.length;
    $('empty').hidden = records.length > 0;
  }

  $('add-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!healthy) return;
    try {
      const id = globalThis.crypto?.randomUUID?.() || `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      records = addRecord(storage, key, records, $('title').value, $('url').value, id);
      clearError();
      $('add-form').reset();
      render();
      inspect('新增并保存');
      $('status').textContent = '新增记录已写入本案例专用存储。请刷新检查。';
      $('title').focus();
    } catch (error) { fail(error); }
  });

  $('inspect').addEventListener('click', () => inspect());
  $('reset').addEventListener('click', () => {
    if (!storage) return;
    if (!window.confirm('恢复当前版本的 3 条初始样本？这会覆盖当前版本的所有练习链接，另一版本与 LinkShelf 不受影响。')) return;
    try {
      records = restoreSamples(storage, key);
      healthy = true;
      $('add').disabled = false;
      $('inspect').disabled = false;
      clearError();
      render();
      inspect('恢复初始样本');
      $('status').textContent = '当前版本已恢复 3 条合成样本，可重新开始调查。';
    } catch (error) { fail(error); }
  });

  try {
    storage = window.localStorage;
    const initial = readRecords(storage, key);
    records = initial === null ? restoreSamples(storage, key) : initial;
    healthy = true;
  } catch (error) { fail(error); }
  $('add').disabled = !healthy;
  $('reset').disabled = !storage;
  $('inspect').disabled = !healthy;
  render();
  if (healthy) inspect('页面初始化');
}
