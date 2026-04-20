# mdrun

基于 Markdown 的任务运行器 —— **文档优先，命令其次**。

命令通过代码块 info string 中的元数据标签声明。文档在任何 Markdown 查看器中都能正常渲染；mdrun 只是执行你已经写好的脚本。

> [English Documentation](./README.md)

## 为什么选择 mdrun？

大多数任务运行器要求你编写专用的配置文件（`Makefile`、`Taskfile.yml`、`package.json` scripts）。mdrun 让你直接在任何 Markdown 文档中嵌入可执行命令 —— 无论是 `README.md`、`BUILD.md`，还是 AI Agent 使用的 `SKILL.md` —— 而不影响文档的可读性。

## 安装

```sh
# 全局安装
bun add -g mdrun

# 或不安装直接使用
bunx mdrun --help
```

## 快速开始

创建 `mdrun.md` 文件（或 `BUILD.md`、`SKILL.md`、`README.md` 之一）：

````markdown
# 我的项目

一些文档说明。

```bash cmd=build desc=构建项目
cargo build --release
```

```bash cmd=test desc=运行测试
cargo test
```

```bash cmd=db.migrate desc=执行数据库迁移
diesel migration run
```
````

然后运行命令：

```sh
mdrun build
mdrun test
mdrun db migrate

# 列出所有命令
mdrun --tree

# 以 JSON 格式输出（用于工具集成）
mdrun --json
```

## Info String 标签

| 标签 | 是否必须 | 说明 |
| --- | --- | --- |
| `cmd=` | 是 | 命令名称；使用点号表示子命令（`db.migrate`） |
| `args=` | 否 | 参数声明（见[参数语法](#参数语法)） |
| `desc=` | 否 | 命令描述，显示在帮助输出中 |
| `ref=` | 否 | 通过 `id=` 引用 YAML 元数据块 |
| `os=` | 否 | 平台过滤：`linux`、`mac`、`windows`（逗号分隔） |
| `id=` | — | YAML 元数据块的标识符，供 `ref=` 引用 |

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

对于复杂命令，在带 `id=` 的 YAML 代码块中声明参数，并在脚本块中通过 `ref=` 引用：

````markdown
```yaml id=deploy-meta
desc: 部署应用到指定环境
confirm: 确认部署到 $env？此操作不可撤销。
args:
  env:
    required: true
    desc: 目标环境（staging/production）
  dry-run:
    type: boolean
    desc: 模拟执行，不实际变更
```

```bash cmd=deploy ref=deploy-meta
echo "正在部署到 $env..."
if [ "$dry_run" = "true" ]; then
  echo "（dry run，无实际变更）"
fi
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

选项：
  -f, --file <file>   指定 Markdown 文件（默认：自动查找）
  --tree              以树形格式列出所有可用命令
  --json              以 JSON 格式输出命令结构
  -h, --help          显示帮助
  -V, --version       显示版本
```

**默认文件查找顺序**（未指定 `-f` 时，在当前目录按以下顺序查找）：

1. `mdrun.md` —— 专为 mdrun 准备
2. `BUILD.md` —— 构建和开发命令
3. `SKILL.md` —— AI Agent Skill 入口
4. `README.md` —— 通用项目入口
