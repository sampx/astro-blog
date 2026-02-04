# 个人博客 & 教程平台

本项目是一个基于 Astro 构建的高性能个人博客，并集成了数字教程销售功能。

## 主要功能

- **博客**：分享技术文章和心得。
- **教程商店**：展示付费教程，支持二维码支付引导。
- **高性能**：基于 Astro 静态生成，加载速度极快。
- **SEO 友好**：内置 SEO 优化。

## 快速开始

1.  **安装依赖**：

    ```bash
    pnpm install
    ```

2.  **启动开发服务器**：

    ```bash
    pnpm dev
    ```

    访问 `http://localhost:4321` 查看效果。

## 管理内容

### 添加博客文章

在 `src/content/post/` 目录下创建一个新的 Markdown (`.md` 或 `.mdx`) 文件。

**基础文章模板：**

```markdown
---
publishDate: 2024-02-04
title: "我的第一篇博客"
excerpt: "这是文章的简短摘要，会在列表中显示。"
image: "~/assets/images/blog-cover.jpg"
category: "技术分享"
tags:
  - astro
  - web
---

这里是文章正文...
```

### 添加新教程

在 `src/content/products/` 目录下创建一个新的 `.md` 文件，例如 `my-new-course.md`。

文件内容示例（Frontmatter + 内容）：

```markdown
---
title: "我的新教程"
price: 99
description: "一句话描述这个教程是关于什么的。"
image: "~/assets/images/course-cover.jpg"
---

## 教程详情

在这里使用 Markdown 编写教程的详细介绍。

- 亮点 1
- 亮点 2
```

### 配置收款二维码

1.  准备您的收款二维码图片（微信或支付宝）。
2.  将图片命名为 `qr-code.jpg` (或其他名称)。
3.  放入 `src/assets/images/` 目录。
4.  修改 `src/pages/tutorials/[...slug].astro` 文件，找到二维码图片引用的位置，替换为您上传的文件名。

## 构建与部署

```bash
pnpm build
```

构建产物将位于 `dist/` 目录。

## 认证与权限

本项目集成了 GitHub OAuth 登录功能，用于解锁受保护的内容。

### 1. 认证机制

- **GitHub OAuth**: 使用 `src/lib/server/oauth.ts` 处理 GitHub 回调。
- **Session 管理**: 基于 SQLite 数据库存储会话，使用 `src/middleware.ts` 拦截所有请求验证 Cookie。
- **用户信息**: 登录用户数据存储在 `user` 表中，每次请求通过 `Astro.locals.user` 访问。

### 2. 内容保护

博客文章支持“受保护”模式，只有登录用户才能阅读全文。

**如何设置：**
在文章 Frontmatter 中添加 `protected: true`：

```yaml
---
title: "我的私密文章"
protected: true
---
```

**工作原理：**

- 未登录用户只能看到文章标题和摘要，正文会被模糊处理或隐藏，并显示“请登录后阅读”的提示。
- 使用 `ProtectedContent` 组件动态判断用户状态并渲染内容。
