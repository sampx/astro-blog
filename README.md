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
    npm install
    # 或者
    pnpm install
    ```

2.  **启动开发服务器**：

    ```bash
    npm run dev
    ```

    访问 `http://localhost:4321` 查看效果。
    访问 `http://localhost:4321/tutorials` 查看教程列表。

## 管理内容

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
npm run build
```

构建产物将位于 `dist/` 目录。
