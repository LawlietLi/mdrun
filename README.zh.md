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
# 全局安装
npm install -g @leyohli/mdrun

# 或不安装直接使用
npx @leyohli/mdrun --help
```

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

[example/mdrun.md](./example/mdrun.md) 涵盖所有特性 —— 基础命令、参数、子命令、YAML 元数据和多平台支持。直接运行：

```sh
# 列出所有可用命令
mdrun -f example/mdrun.md --tree

# 运行命令
mdrun -f example/mdrun.md greet world
mdrun -f example/mdrun.md db migrate

# 子命令帮助
mdrun -f example/mdrun.md db --help
```

## Info String 标签

| 标签 | 是否必须 | 说明 |
| --- | --- | --- |
| `cmd=` | 是 | 命令名称；使用点号表示子命令（`db.migrate`） |
| `args=` | 否 | 参数声明（见[参数语法](#参数语法)） |
| `desc=` | 否 | 命令描述，显示在帮助输出中 |
| `confirm=` | 否 | 执行前的确认提示（支持 `$variable` 插值） |
| `spec=` | 否 | 通过 `id=` 引用 YAML 元数据块（优先于 `args=`） |
| `os=` | 否 | 平台过滤：`linux`、`mac`、`windows`（逗号分隔） |
| `id=` | — | YAML 元数据块的标识符，供 `spec=` 引用 |

## 参数语法

`args=` 标签支持紧凑的单行语法：

| Token | 含义 |
| --- | --- |
| `(name)` | 必填位置参数 |
| `[name]` | 可选位置参数 |
| `[--flag]` | 可选布尔标志 |
| `[-p/--port=<port>]` | 可选字符串选项（短+长形式） |
| `(-d/--domain=<domain>)` | 必填字符串选项 |
| `[--port=<port:number>]` | 带类型注解的选项（`string`/`number`/`boolean`） |
| `[--tag=<tag>=latest]` | 带默认值的选项 |

**变量注入规则：** 选项名以环境变量形式注入，连字符替换为下划线。`--dry-run` 变为 `$dry_run`（同时注入 `$DRY_RUN`）。

## YAML 元数据块

对于复杂命令，在带 `id=` 的 YAML 代码块中声明参数，并在脚本块中通过 `spec=` 引用：

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

## 多平台支持

使用 `os=` 为同一命令提供平台特定实现，mdrun 在运行时自动选择匹配的代码块：

````markdown
```bash cmd=build os=linux,mac
cargo build --release
```

```powershell cmd=build os=windows
cargo build --release
```
````

支持的平台值：`linux`、`mac`、`windows`。

## CLI 参考

```text
mdrun [OPTIONS] [COMMAND] [ARGS...]

Options:
  -f, --file <file>   Markdown file to use (default: auto-discover)
  --tree              List all available commands in tree format
  --json              Output command structure as JSON
  -h, --help          Show help
  -V, --version       Show version
```

**默认文件查找顺序**（未指定 `-f` 时，在当前目录按以下顺序查找）：

1. `mdrun.md` —— 专为 mdrun 准备
2. `BUILD.md` —— 构建和开发命令
3. `SKILL.md` —— AI Agent Skill 入口
4. `README.md` —— 通用项目入口
