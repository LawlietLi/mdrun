# mdrun

基于 Markdown 的任务运行器 —— **文档优先，命令其次**。

命令通过代码块 info string 中的元数据标签声明。文档在任何 Markdown 查看器中都能正常渲染；mdrun 只是执行你已经写好的脚本。

受 [Makefile](https://www.gnu.org/software/make/)、[just](https://github.com/casey/just) 和 [mask](https://github.com/jacobdeichert/mask) 启发，专注于将文档与可执行命令放在同一个地方，让人和 AI Agent 都能直接读懂并执行。

> [English Documentation](./README.md)

## 为什么选择 mdrun？

大多数任务运行器要求你编写专用的配置文件（`Makefile`、`Taskfile.yml`、`package.json` scripts）。mdrun 让你直接在任何 Markdown 文档中嵌入可执行命令 —— 无论是 `README.md`、`BUILD.md`，还是 AI Agent 使用的 `SKILL.md` —— 而不影响文档的可读性。

Markdown 的天然结构也非常适合对 AI Agent 进行[渐进式披露](https://en.wikipedia.org/wiki/Progressive_disclosure)。Agent 无需将整个文档塞入上下文，只需调用 `mdrun --tree` 获取精简的命令列表，再通过 `mdrun <cmd> --help` 按需获取具体参数 —— 让上下文窗口保持小而专注。

## 安装

```sh
npm install -g @leyohli/mdrun
```

其他包管理器：

```sh
pnpm add -g @leyohli/mdrun
yarn global add @leyohli/mdrun
bun add -g @leyohli/mdrun

# 不安装直接使用
npx @leyohli/mdrun --help
```

需要 Node.js ≥ 18。

## 立即体验

这个 README 本身就是一个可运行的 mdrun 文件，安装后直接试试：

```sh
mdrun -f README.md hi
mdrun -f README.md hi world
mdrun -f README.md hi world --strong
```

```bash cmd=hi args=[name] [-s/--strong] desc=Say hi
echo "hello, ${name:-world}${strong:+!}"
```

## 快速开始

在项目中创建 `mdrun.md`：

````markdown
```bash cmd=build desc=构建项目
npm run build
```

```bash cmd=test desc=运行测试
npm test
```

```bash cmd=db.migrate desc=执行数据库迁移
npm run db:migrate
```
````

运行命令：

```sh
mdrun build
mdrun test
mdrun db migrate

# 列出所有命令
mdrun --tree

# 查看命令帮助
mdrun db migrate --help
```

完整示例见 [example/mdrun.md](./example/mdrun.md)，涵盖参数、子命令、YAML 元数据、多平台支持和确认提示。

## 子命令

在 `cmd=` 中使用点号表示法对命令分组，无需显式声明组：

````markdown
```bash cmd=db.migrate desc=执行数据库迁移
diesel migration run
```

```bash cmd=db.seed desc=填充测试数据
cargo run --bin seed
```
````

```sh
mdrun db --help     # 显示 migrate、seed
mdrun db migrate
```

## 参数与选项

通过 `args=` 内联声明参数。位置参数用 `(必填)` 或 `[可选]`；选项用 `[--flag]` 或 `[-p/--port=<port>=3000]`：

````markdown
```bash cmd=deploy args=(-e/--env=<env>) [--dry-run] desc=部署应用
echo "Deploying to $env"
[ -n "$dry_run" ] && echo "(dry run)"
```
````

参数以环境变量形式注入 —— `--dry-run` 变为 `$dry_run` 和 `$DRY_RUN`。
布尔标志未传时不注入，`[ -n "$flag" ]` 和 `${flag:+...}` 可直接使用。

## YAML 元数据

参数较多或需要确认提示时，使用 `yaml id=` 块声明，并通过 `spec=` 引用：

````markdown
```yaml id=deploy-meta
desc: Deploy the application
confirm: Deploy to $env? This cannot be undone.
args:
  env:
    required: true
    desc: Target environment (staging/production)
  dry-run:
    type: boolean
    desc: Simulate without making changes
```

```bash cmd=deploy spec=deploy-meta
echo "Deploying to $env..."
[ -n "$dry_run" ] && echo "(dry run)"
```
````

存在 `spec=` 时，内联 `args=` 会被忽略。

## 多平台

对同一 `cmd=` 用不同 `os=` 标签提供平台特定实现，mdrun 在运行时自动选择：

````markdown
```bash cmd=build os=linux,mac
cargo build --release
```

```powershell cmd=build os=windows
cargo build --release
```
````

## 完整规范

所有标签、参数类型、YAML 字段、变量注入规则的完整说明见 [docs/spec.md](./docs/spec.md)。

## Programmatic API

mdrun 也可以作为库使用：

```typescript
import { readFileSync } from "fs";
import { parseMarkdown, buildCommandTree, executeCommand } from "mdrun";

const source = readFileSync("mdrun.md", "utf8");
const blocks = parseMarkdown(source);
const { commands } = buildCommandTree(blocks);

const cmd = commands.find(c => c.name === "build");
if (cmd) {
  const result = await executeCommand(cmd, { args: {} });
  process.exit(result.exitCode);
}
```

## 许可证

MIT © 2025 Li Yiheng
