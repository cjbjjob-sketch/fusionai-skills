# FusionAI Skills：AI 生图、参考图编辑与电商产品图

为 Codex、Claude Code 等 Agent 提供可安装的技能，并提供无需第三方依赖的 Node.js 命令行工具。通过 [FusionAI](https://www.fusionai.tv/zh/studio/ai-image) 完成文本生图、参考图编辑和商品摄影流程。

[English](README.md) · [API 文档](https://www.fusionai.tv/openapi/docs) · [真实案例](examples/README.md)

## 包含什么

- **fusionai-images**：查询已开放的 API 模型、文本生图、本地多参考图编辑、保存结果。
- **fusionai-product-photography**：明确商品与场景参考图的分工，组织提示词，逐项验收商品细节。
- **三个真实案例**：服装图＋模特图合成、背包商品场景合成、移除商品照片中的干扰道具。

命令行工具支持 GPT Images 和 Gemini 原生图像协议。模型 ID、权限与价格以你自己的 `/v1/models` 返回为准。工作台模型与 Open API 目录独立；本版暂未实现视频、Midjourney 异步轮询或 Grok URL 编辑。

## 快速开始

安装 Node.js 22+，在 [开发者控制台](https://www.fusionai.tv/openapi/console) 申请接入，审核后创建自己的 API Key。

```bash
git clone https://github.com/cjbjjob-sketch/fusionai-skills.git
cd fusionai-skills
node skills/fusionai-images/scripts/fusionai.mjs help
```

将 Key 通过环境变量或密钥管理器设置为 `FUSIONAI_API_KEY`。工具不会自动加载 `.env`；[英文说明](README.md#quick-start) 提供了不将密钥写进命令历史的 Bash、PowerShell 输入方式。

先查询当前目录：

```bash
node skills/fusionai-images/scripts/fusionai.mjs models
```

然后预览请求，不调用模型，也不产生费用：

```bash
node skills/fusionai-images/scripts/fusionai.mjs generate --model gpt-image-2 --prompt "米白色帆布背包放在浅色石台上，柔和侧光，保持商品轮廓清晰，不添加文字" --size 1024x1024 --resolution 1K --dry-run
```

确认目录中的模型、参数与计费后，将 `--dry-run` 换成 `--confirm-paid`，授权一次真实生成。结果默认保存在 `outputs/`，可用 `--output-dir` 修改目录。

参考图编辑：

```bash
node skills/fusionai-images/scripts/fusionai.mjs edit --model gpt-image-2 --image ./product.png --prompt "保留商品形状、标签、五金和颜色，只替换为浅灰绿色背景，并添加自然接触阴影，不添加其他物品" --resolution 1K --dry-run
```

`--image` 可重复，最多四张。Gemini 也使用同一命令，但指定对应模型，并使用 `--aspect-ratio`；完整命令见 [英文文档](README.md)。长提示词可用 `--prompt-file` 读取。

## 安装 Agent 技能

将 `skills/fusionai-images` 和 `skills/fusionai-product-photography` 两个完整目录复制到：

- Codex：`~/.codex/skills/`
- Claude Code：`~/.claude/skills/`

然后可请求：“使用 `$fusionai-images` 查询可用模型，准备商品换背景请求”，或“使用 `$fusionai-product-photography` 为这件亚麻连衣裙规划商品图”。新技能未出现时，刷新或重启 Agent。

## 如何理解案例

案例使用既有工作台真实结果，保留原始提示词、参数、生成尺寸和检查要点，**不冒充本工具新生成的 API 结果**。模型与产品标识保留、包装文字、服装面料等仍需人工对照，不能仅凭缩略图验收。

超时后工具不会自动重新发起付费请求；先到请求记录确认状态。生成成功但本地保存失败时，应保留请求 ID 排查，不要直接再生成。

开发检查：`npm test`、`npm run check`。测试采用本地模拟数据，不消耗积分。代码和仓库文档采用 MIT 协议；案例媒体和品牌标识的权利说明见 [MEDIA.md](docs/MEDIA.md)。
