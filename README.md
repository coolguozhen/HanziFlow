<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HanziFlow Lite - 汉字学习应用（轻量版）

这是 HanziFlow 的轻量版本，使用本地数据和浏览器内置功能，无需 AI API，响应更快。

## 特性

- ✅ **快速搜索**：使用本地汉字数据库，无需等待 AI 响应
- ✅ **离线可用**：不依赖外部 API，完全本地运行
- ✅ **免费语音**：使用浏览器内置 TTS，无需 API 费用
- ✅ **相同 UI**：保持与原版完全一致的界面和体验

## 与原版的区别

- ❌ 不使用 Gemini AI（节省 API 费用）
- ✅ 使用本地汉字数据库（快速响应）
- ✅ 使用浏览器内置 TTS（免费语音）
- ✅ 支持常用汉字搜索和详情

## 运行本地

**前置要求：** Node.js

1. 安装依赖：
   ```bash
   npm install
   ```

2. 运行应用：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

## 技术栈

- **cnchar**: 提供拼音、笔画、部首等核心功能
- **zdict.js**: 提供汉典网站的汉字释义和组词数据（可选）
- **React + TypeScript**: 前端框架
- **Vite**: 构建工具

## 数据源配置

### 使用 zdict.js 数据（推荐）

应用会自动尝试从以下位置加载 zdict.js 数据：

1. 本地文件：`/zdict-data.json` 或 `/data/zdict.json`

**数据来源说明：**

- **GitHub 仓库**：[yihui/zdict.js](https://github.com/yihui/zdict.js) - 原始数据仓库
- **npm 包**：`@xiee/zdict` - 由 Yihui Xie 发布的 npm 版本（与 GitHub 仓库相同）

**自动下载 zdict 数据（推荐）：**

项目已经包含了 `@xiee/zdict` 依赖（即 `yihui/zdict.js` 的 npm 版本），运行以下命令可以自动提取数据：

```bash
npm run download-zdict
```

这个脚本会：
- 从已安装的 `@xiee/zdict` npm 包中提取数据（数据来自 [yihui/zdict.js](https://github.com/yihui/zdict.js)）
- 转换为 JSON 格式
- 保存到 `public/zdict-data.json`

**手动配置 zdict.js 数据：**

如果自动脚本失败，可以手动操作：

1. 从 [zdict.js GitHub 仓库](https://github.com/yihui/zdict.js) 下载 `js/zdict.js` 文件
2. 将 JavaScript 数据转换为 JSON 格式（数据通常是导出的对象）
3. 将转换后的 JSON 文件放置到 `public/zdict-data.json`
4. 应用会自动加载并使用这些数据

**数据格式说明：**

zdict.js 的原始数据是 JavaScript 格式，需要转换为 JSON。数据应该是一个对象，键是汉字字符，值是包含 `definition`、`words` 等字段的对象。

如果没有 zdict.js 数据，应用会：
- 使用 cnchar 提供拼音、笔画、部首等基础信息
- 使用缓存的数据（如果之前加载过）
- 对于没有缓存的汉字，显示"暂无释义"

### 扩展数据库

要添加更多汉字数据，可以：
- 使用 zdict.js 数据文件（推荐，包含完整释义和组词）
- 编辑 `services/hanzi-data.ts` 中的缓存逻辑
