# GitHub Pages + VitePress 配置模板（不是正式阅读站）

这里存放几份**可以让 Codex 复制、改造**的初始配置文件：

```text
deploy-template/
├── .github/workflows/deploy.yml
├── .gitignore
├── package.json
└── book/
    ├── index.md                    # 只用于测试构建的占位首页，正式实现必须替换
    └── .vitepress/config.mts
```

Codex 在项目仓库根目录中复制所需文件之后，还需要：

1. 按 `02_完整目录与各章任务.md` 把真实章节写在 `book/`；不要把示例 index 当作完成的教材。
2. 运行 `npm install` 生成 `package-lock.json` 并提交到 Git，供 GitHub Actions `npm ci` 使用。
3. 根据真实章节定制 VitePress 导航、首页、样式与交互组件；不维护第二套正文。
4. 本地实际执行 `npm run build` / `npm run preview`，并以 `SITE_BASE=/codex-mastery-lab/` 模拟子路径进行检查。
5. 征得用户授权才公开发布到 GitHub。未授权时只完成本地工作。

如果 Codex 最终选择不同的、同样支持 GitHub Pages 的静态框架，需要先以可用成果说明取舍，并提供等价的 Actions 构建与路径验证；不要凭偏好换技术栈。
