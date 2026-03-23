# siyuan-cli

[English](./README.md)

这是一个面向思源笔记的 CLI，适合在终端里快速搜索笔记、读取文档、更新内容和导出结果。

```bash
npx siyuan-cli search --content "roadmap" --json
```

运行前请先设置 `SIYUAN_BASE_URL` 和 `SIYUAN_TOKEN`。

- 按正文、文件名或标签搜索笔记
- 用 Markdown 读取和更新文档
- 导出为 Markdown、HTML、PDF 或 DOCX

面向 SiYuan Note 的人类友好命令行工具。它把 SiYuan HTTP API 封装成按任务组织的命令，让你可以在终端里搜索笔记、读取文档、更新内容、查看笔记本、管理标签、导出数据，并把这些流程稳定地接入脚本或 Agent。

## 为什么使用它

- 命令按任务命名，不需要直接拼原始 API 请求
- 大多数命令支持 `--json`，便于脚本和 Agent 消费
- 破坏性操作默认更安全，通过 `--yes` 显式确认
- 文档和块支持基于 Markdown 文本或文件的写入流程
- 覆盖文档、笔记本、块、标签、导出、文件、快照、模板、通知、SQL 和系统状态等能力

## 运行要求

- Node.js `>=20`
- 可访问的 SiYuan 实例
- 有效的 SiYuan API Token

## 安装

推荐的 npm 用法：

```bash
npx siyuan-cli --help
```

本地开发安装：

```bash
npm install
npm run build
```

在仓库根目录调试运行：

```bash
node dist/src/cli/run.js --help
```

如果你希望有一个长期可用的全局命令，也可以安装：

```bash
npm install -g siyuan-cli
siyuan-cli --help
```

本文所有面向用户的示例默认都使用 `npx siyuan-cli ...`。如果你是在仓库里直接开发或调试，请把 `npx siyuan-cli` 替换成 `node dist/src/cli/run.js`。

## 配置

CLI 只读取这两个环境变量：

- `SIYUAN_BASE_URL`
- `SIYUAN_TOKEN`

示例：

```bash
export SIYUAN_BASE_URL="http://127.0.0.1:6806"
export SIYUAN_TOKEN="your-token"
```

任一变量缺失时，命令都会在运行时直接报出可读错误。

## 快速开始

```bash
npx siyuan-cli system version
npx siyuan-cli search --content "project alpha"
npx siyuan-cli doc get --id 20260316120000-abc123
npx siyuan-cli notebook list
npx siyuan-cli sql query --statement "select * from blocks limit 5"
npx siyuan-cli tag list
```

## 命令总览

顶层命令组如下：

```text
system     attr       block      search     snapshot   template
notify     doc        export     file       sql        tag
notebook
```

随时可以查看内置帮助：

```bash
npx siyuan-cli --help
npx siyuan-cli doc --help
npx siyuan-cli block update --help
```

## Agent 使用

如果你希望 AI Agent 稳定地使用这个 CLI，建议先查看 `skills/siyuan-cli/SKILL.md`。它专门说明了 Agent 何时应该优先使用真实的 `npx siyuan-cli` 命令形式、何时加 `--json`，以及如何安全处理破坏性操作。

## 使用约定

- `ID` - 大多数读取、更新、导出、删除流程都依赖 SiYuan 的 document id、block id、notebook id、snapshot id 等标识。
- `--json` - 适合脚本、管道处理和 Agent 调用，返回更稳定的机器可读结构。
- `--yes` - 用于 `doc remove`、`block remove`、`file remove`、`snapshot restore`、`snapshot remove`、`template remove`、`tag remove` 等破坏性操作。
- `--content` 与 `--content-file` - 文档和块写入命令既支持内联 Markdown，也支持从文件读取 Markdown。
- `默认文本输出` - 默认输出更适合人直接阅读，不适合做稳定解析。

## 命令详解

### `system`

查看 SiYuan 运行状态。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli system version` | 查看当前 SiYuan 版本 | `--json` |
| `npx siyuan-cli system time` | 查看服务端时间 | `--json` |
| `npx siyuan-cli system boot-progress` | 查看启动进度百分比 | `--json` |

示例：

```bash
npx siyuan-cli system version
npx siyuan-cli system time --json
npx siyuan-cli system boot-progress
```

### `search`

按内容、文件名或标签搜索笔记。至少要提供一个搜索条件。

| 参数 | 说明 |
| --- | --- |
| `--content <text>` | 按笔记正文搜索 |
| `--filename <text>` | 按标题或路径搜索 |
| `--tag <tag>` | 按标签搜索 |
| `--limit <number>` | 限制返回数量，默认 `10` |
| `--json` | 输出原始 JSON |

示例：

```bash
npx siyuan-cli search --content "project alpha"
npx siyuan-cli search --filename "meeting" --limit 20
npx siyuan-cli search --tag work --json
```

提示：如果下一步要继续执行 `doc get`、`doc update`、`export markdown` 等依赖文档 ID 的命令，建议直接加 `--json`。

### `doc`

以 Markdown 形式读取和编辑文档。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli doc get` | 读取单个文档 | `--id`, `--json` |
| `npx siyuan-cli doc create` | 用 Markdown 创建文档 | `--notebook`, `--path`, `--content` 或 `--content-file`, `--json` |
| `npx siyuan-cli doc update` | 替换文档 Markdown 内容 | `--id`, `--content` 或 `--content-file`, `--json` |
| `npx siyuan-cli doc append` | 追加 Markdown 内容 | `--id`, `--content` 或 `--content-file`, `--json` |
| `npx siyuan-cli doc rename` | 重命名文档路径 | `--id`, `--path`, `--json` |
| `npx siyuan-cli doc move` | 移动文档到新路径 | `--id`, `--path`, `--json` |
| `npx siyuan-cli doc remove` | 删除文档 | `--id`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli doc get --id 20260316120000-abc123

npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/cli-guide \
  --content-file ./post.md

npx siyuan-cli doc update \
  --id 20260316120000-abc123 \
  --content "# Updated title"

npx siyuan-cli doc append \
  --id 20260316120000-abc123 \
  --content-file ./appendix.md

npx siyuan-cli doc remove --id 20260316120000-abc123 --yes
```

#### 发布包含图片的 Markdown

`doc create`、`doc update` 和 `doc append` 支持处理带图片引用的 Markdown。命令会在内容发送给 SiYuan 之前扫描 Markdown 图片语法、上传图片，并自动把图片链接重写成上传后的资源路径。

使用 Markdown 文件：

```bash
npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/with-images \
  --content-file ./post.md
```

使用内联 Markdown：

```bash
npx siyuan-cli doc update \
  --id 20260316120000-abc123 \
  --content "# Hello\n\n![](https://example.com/cover.png)"
```

支持的图片来源：

- 相对本地路径，例如 `./img/cover.png`
- 绝对本地路径，例如 `/Users/name/Pictures/cover.png`
- 远程 URL，例如 `https://example.com/cover.png`
- `data:` URI

当前行为：

- 上传后的图片会放到 `/data/assets/cli-publish/<date>/...`
- Markdown 图片链接会自动改写成上传后的资源路径
- 相对路径会基于 `--content-file` 所在位置解析
- 只要有一张图片解析或上传失败，整次发布都会失败

### `notebook`

查看和管理笔记本。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli notebook list` | 列出所有笔记本 | `--json` |
| `npx siyuan-cli notebook get` | 查看单个笔记本 | `--id`, `--json` |
| `npx siyuan-cli notebook create` | 创建笔记本 | `--name`, `--json` |
| `npx siyuan-cli notebook open` | 打开笔记本 | `--id`, `--json` |
| `npx siyuan-cli notebook close` | 关闭笔记本 | `--id`, `--json` |
| `npx siyuan-cli notebook rename` | 重命名笔记本 | `--id`, `--name`, `--json` |
| `npx siyuan-cli notebook remove` | 删除笔记本 | `--id`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli notebook list
npx siyuan-cli notebook get --id nb-1 --json
npx siyuan-cli notebook create --name "Projects"
npx siyuan-cli notebook rename --id nb-1 --name "Archive"
npx siyuan-cli notebook remove --id nb-1 --yes
```

### `block`

查看块信息，并修改块内容或位置。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli block get` | 查看单个块 | `--id`, `--json` |
| `npx siyuan-cli block children` | 查看子块列表 | `--id`, `--json` |
| `npx siyuan-cli block update` | 替换块内容 | `--id`, `--content` 或 `--content-file`, `--json` |
| `npx siyuan-cli block insert` | 在指定块后插入新块 | `--id`, `--content` 或 `--content-file`, `--json` |
| `npx siyuan-cli block move` | 移动到新的父块下 | `--id`, `--parent`, `--json` |
| `npx siyuan-cli block remove` | 删除块 | `--id`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli block get --id blk-1
npx siyuan-cli block children --id blk-1 --json
npx siyuan-cli block update --id blk-1 --content-file ./section.md
npx siyuan-cli block insert --id blk-1 --content "- Follow-up item"
npx siyuan-cli block move --id blk-1 --parent parent-123
npx siyuan-cli block remove --id blk-1 --yes
```

### `export`

预览导出信息，或把文档导出为指定格式。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli export preview` | 预览导出信息 | `--id`, `--json` |
| `npx siyuan-cli export markdown` | 导出为 Markdown | `--id`, `--json` |
| `npx siyuan-cli export html` | 导出为 HTML | `--id`, `--json` |
| `npx siyuan-cli export pdf` | 导出为 PDF | `--id`, `--json` |
| `npx siyuan-cli export docx` | 导出为 DOCX | `--id`, `--json` |

示例：

```bash
npx siyuan-cli export preview --id 20260316120000-abc123
npx siyuan-cli export markdown --id 20260316120000-abc123 --json
npx siyuan-cli export pdf --id 20260316120000-abc123
```

### `file`

浏览、读取、写入和删除 SiYuan 工作区里的文件。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli file tree` | 列出路径下的文件 | `--path`, `--json` |
| `npx siyuan-cli file read` | 读取文件内容 | `--path`, `--json` |
| `npx siyuan-cli file write` | 写入文件内容 | `--path`, `--content`, `--json` |
| `npx siyuan-cli file remove` | 删除文件 | `--path`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli file tree --path /data/assets
npx siyuan-cli file read --path /data/storage/notes/readme.md
npx siyuan-cli file write --path /data/storage/tmp/demo.md --content "hello"
npx siyuan-cli file remove --path /data/storage/tmp/demo.md --yes
```

### `attr`

查看可用属性键，以及读取/写入块属性。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli attr get` | 查看某个块的属性 | `--id`, `--json` |
| `npx siyuan-cli attr list` | 列出可用属性键 | `--json` |
| `npx siyuan-cli attr set` | 设置属性 | `--id`, `--key`, `--value`, `--json` |
| `npx siyuan-cli attr reset` | 重置属性 | `--id`, `--key`, `--json` |

示例：

```bash
npx siyuan-cli attr list
npx siyuan-cli attr get --id blk-1
npx siyuan-cli attr set --id blk-1 --key custom-status --value active
npx siyuan-cli attr reset --id blk-1 --key custom-status
```

### `snapshot`

查看和管理仓库快照。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli snapshot list` | 列出快照 | `--json` |
| `npx siyuan-cli snapshot current` | 查看当前快照 | `--json` |
| `npx siyuan-cli snapshot create` | 创建快照 | `--memo`, `--json` |
| `npx siyuan-cli snapshot restore` | 恢复某个快照 | `--id`, `--yes`, `--json` |
| `npx siyuan-cli snapshot remove` | 删除快照 | `--id`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli snapshot list
npx siyuan-cli snapshot create --memo "before-import"
npx siyuan-cli snapshot restore --id snap-1 --yes
npx siyuan-cli snapshot remove --id snap-1 --yes
```

### `template`

查看、渲染和删除模板。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli template list` | 列出模板 | `--json` |
| `npx siyuan-cli template get` | 按路径读取模板 | `--path`, `--json` |
| `npx siyuan-cli template render` | 把模板渲染到指定文档 | `--path`, `--id`, `--json` |
| `npx siyuan-cli template remove` | 删除模板 | `--path`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli template list
npx siyuan-cli template get --path templates/daily-note.md
npx siyuan-cli template render --path templates/daily-note.md --id 20260316120000-abc123
npx siyuan-cli template remove --path templates/old.md --yes
```

### `notify`

发送和查看通知。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli notify push` | 推送一条通知 | `--msg`, `--json` |
| `npx siyuan-cli notify list` | 列出通知 | `--json` |
| `npx siyuan-cli notify clear` | 清空通知 | `--json` |

示例：

```bash
npx siyuan-cli notify push --msg "Publish complete"
npx siyuan-cli notify list --json
npx siyuan-cli notify clear
```

### `sql`

对 SiYuan 执行只读 SQL 查询。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli sql query` | 执行 SQL 语句 | `--statement`, `--json` |

示例：

```bash
npx siyuan-cli sql query --statement "select * from blocks limit 5"
npx siyuan-cli sql query --statement "select id, updated from blocks order by updated desc limit 10" --json
```

### `tag`

查看标签、列出某标签下的文档、重命名标签或删除标签。

| 命令 | 说明 | 关键参数 |
| --- | --- | --- |
| `npx siyuan-cli tag list` | 列出标签及计数 | `--json` |
| `npx siyuan-cli tag docs` | 查看某标签下的文档 | `--label`, `--json` |
| `npx siyuan-cli tag rename` | 重命名标签 | `--old`, `--new`, `--json` |
| `npx siyuan-cli tag remove` | 删除标签 | `--label`, `--yes`, `--json` |

示例：

```bash
npx siyuan-cli tag list
npx siyuan-cli tag docs --label work
npx siyuan-cli tag rename --old project/alpha --new project/archive/alpha
npx siyuan-cli tag remove --label obsolete --yes
```

## 常见工作流

先搜索，再读取，再导出：

```bash
npx siyuan-cli search --content "roadmap" --json
npx siyuan-cli doc get --id 20260316120000-abc123
npx siyuan-cli export markdown --id 20260316120000-abc123
```

从本地 Markdown 文件创建文档：

```bash
npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/weekly-update \
  --content-file ./weekly-update.md
```

查看笔记本后移动文档：

```bash
npx siyuan-cli notebook list
npx siyuan-cli doc move --id 20260316120000-abc123 --path /archive/2026/weekly-update
```

给块附加元数据：

```bash
npx siyuan-cli attr set --id blk-1 --key review-status --value done
npx siyuan-cli attr get --id blk-1 --json
```

## JSON 输出与脚本集成

大多数已实现命令都支持 `--json`。

推荐在这些场景使用：

- 需要把输出交给 `jq` 等工具处理
- 需要把 ID 传给下一条命令
- 需要在 Agent 或脚本中调用
- 不想解析面向人类的文本输出

示例：

```bash
npx siyuan-cli search --tag work --json | jq '.[].id'
npx siyuan-cli notebook list --json
npx siyuan-cli export preview --id 20260316120000-abc123 --json
```

## 破坏性命令

破坏性命令被设计成显式确认模式。

- 真正要删除或恢复时再传 `--yes`
- 不传 `--yes` 时，命令会直接中止，而不是静默执行
- 执行 `remove` 或 `restore` 之前，先再次确认目标 ID 或路径

常见破坏性命令：

- `npx siyuan-cli doc remove --id ... --yes`
- `npx siyuan-cli block remove --id ... --yes`
- `npx siyuan-cli file remove --path ... --yes`
- `npx siyuan-cli notebook remove --id ... --yes`
- `npx siyuan-cli snapshot restore --id ... --yes`
- `npx siyuan-cli snapshot remove --id ... --yes`
- `npx siyuan-cli template remove --path ... --yes`
- `npx siyuan-cli tag remove --label ... --yes`

## 开发

```bash
npm install
npm run build
npm test
```

## 发布

GitHub Actions 可以通过两种方式把 `siyuan-cli` 发布到 npm：

- 推送匹配 `v*` 的 Git 标签后自动发布
- 在 GitHub Actions 页面基于默认分支手动触发工作流发布
- 在仓库 Secret 中配置 npm 访问令牌 `NPM_TOKEN`
- 对于标签发布，标签 `vX.Y.Z` 必须和 `package.json` 里的版本 `X.Y.Z` 完全匹配

标签发布示例：

```bash
git tag v0.1.1
git push origin v0.1.1
```

迭代命令时常用的检查方式：

```bash
node dist/src/cli/run.js --help
node dist/src/cli/run.js doc --help
node dist/src/cli/run.js search --content demo --json
```

## 故障排查

`环境变量缺失`

- 确认 `SIYUAN_BASE_URL` 和 `SIYUAN_TOKEN` 在当前 shell 会话中已经导出

`无法运行 CLI`

- 优先使用 `npx siyuan-cli ...`，本地开发时也可以在仓库根目录运行 `node dist/src/cli/run.js ...`

`需要给后续命令传 ID`

- 用 `--json` 重新执行读取或搜索命令

`删除或恢复命令被中止`

- 确认目标 ID 或路径正确后，再加 `--yes` 重试
