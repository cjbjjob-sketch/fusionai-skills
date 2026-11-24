# FusionAI Skills — AI Image Generation & Product Photography

Agent skills and a small, dependency-free CLI for generating images, editing reference photos, and preparing ecommerce product photography with [FusionAI](https://www.fusionai.tv/).

[简体中文](README.zh-CN.md) · [Image Studio](https://www.fusionai.tv/studio/ai-image) · [API documentation](https://www.fusionai.tv/openapi/docs) · [Tested workflows](examples/README.md)

Turn a product brief into an image, place a backpack in a new scene, or remove a distracting prop while reviewing the product's identity. This repository includes actual FusionAI workspace examples, their original prompts, and practical inspection checklists.

## What is included?

| Resource | Purpose |
| --- | --- |
| [fusionai-images](skills/fusionai-images/SKILL.md) | Discover API models, generate images and edit local references |
| [fusionai-product-photography](skills/fusionai-product-photography/SKILL.md) | Plan ecommerce photos, assign reference roles and review results |
| [CLI](skills/fusionai-images/scripts/fusionai.mjs) | Node.js 22+ client; no npm dependencies |
| [Examples](examples/README.md) | Clothing + model composite, backpack scene and object removal |

The CLI supports the `openai-images` GPT Image protocol and native `gemini-generate-content` image protocol. Availability is determined by your authenticated `/v1/models` response. Workspace names and Open API model IDs are separate; never substitute one for the other. Midjourney asynchronous polling, Grok URL editing and video generation are outside this first release.

## Quick start

Requirements: Node.js 22+, an approved FusionAI developer account, and your own API key. Create a key in the [developer console](https://www.fusionai.tv/open-platform); see the [access instructions](https://www.fusionai.tv/openapi/docs#quick-start).

```bash
git clone https://github.com/cjbjjob-sketch/fusionai-skills.git
cd fusionai-skills
node skills/fusionai-images/scripts/fusionai.mjs help
```

Set `FUSIONAI_API_KEY` through your shell or secret manager. The client reads environment variables and does not load `.env` automatically. For an interactive shell, you can enter the key without adding it to command history:

```bash
# Bash
read -rsp "FusionAI API key: " FUSIONAI_API_KEY; echo
export FUSIONAI_API_KEY
```

```powershell
# PowerShell
$credential = Read-Host 'FusionAI API key' -AsSecureString
$env:FUSIONAI_API_KEY = [System.Net.NetworkCredential]::new('', $credential).Password
Remove-Variable credential
```

### 1. Discover current models and prices

```bash
node skills/fusionai-images/scripts/fusionai.mjs models
```

Use an exact model ID and supported parameters from that response. Pricing and access can change; this repository does not freeze a model list or price.

### 2. Preview an AI image generation request

```bash
node skills/fusionai-images/scripts/fusionai.mjs generate --model gpt-image-2 --prompt "One unbranded ivory canvas backpack on a pale stone plinth, soft side light, clear product outline, no text" --size 1024x1024 --resolution 1K --quality high --dry-run
```

Dry runs need no key and make no network requests. They validate the local request shape, not model availability, account access, pricing or generation quality.

### 3. Generate and save an image

After confirming the model, parameters and billable operation, run the same command with `--confirm-paid` in place of `--dry-run`. Results are saved under `outputs/`, with filenames based on their actual image bytes. Use `--output-dir` to choose another directory.

### 4. Edit a product reference image

```bash
node skills/fusionai-images/scripts/fusionai.mjs edit --model gpt-image-2 --image ./product.png --prompt "Keep the exact product shape, label, hardware and color. Replace only the background with a pale sage studio wall. Add a realistic contact shadow. No added accessories or text." --resolution 1K --dry-run
```

Repeat `--image` for up to four references. Use `--mask edit-mask.png` for a PNG mask; transparent areas identify edits. Images are uploaded only when you authorize a real call.

### 5. Use Gemini image generation or reference editing

```bash
node skills/fusionai-images/scripts/fusionai.mjs edit --model gemini-3.1-flash-image --image ./product.png --image ./scene.jpg --prompt "Reference 1 defines only the product. Reference 2 defines the scene and light. Preserve the product's shape and details." --aspect-ratio 4:5 --resolution 1K --dry-run
```

For text-to-image, use `generate` and omit `--image`. Confirm the exact model ID and capabilities in your catalog first. Use `--prompt-file path.txt` for a longer prompt. [Protocol and error reference →](skills/fusionai-images/references/api.md)

## Install the agent skills

Copy both complete skill directories to your agent's skill directory; each includes its own instructions and dependencies:

- Codex: `~/.codex/skills/`
- Claude Code personal skills: `~/.claude/skills/`

For example, after cloning on Bash:

```bash
mkdir -p ~/.codex/skills
cp -R skills/fusionai-images skills/fusionai-product-photography ~/.codex/skills/
```

Then ask: “Use `$fusionai-images` to list my available models and prepare a reference-image edit.” Or: “Use `$fusionai-product-photography` to plan product images for this linen dress.” Restart or refresh your agent if it does not discover newly copied skills.

## Real product photography examples

| Workflow | What to inspect | Original evidence |
| --- | --- | --- |
| [Clothing + model composite](examples/fashion-product-photography/README.md) | Neckline, belt, fabric drape and face consistency | GPT Image 2.6 Sunburst workspace test |
| [Backpack background composition](examples/product-background-replacement/README.md) | Zippers, straps, perspective and contact shadow | Nano Banana 2 workspace test |
| [Remove a distracting prop](examples/object-removal/README.md) | Object boundary, restored surface and headphone details | GPT Image 2.5 Sunburst workspace test |

These are prior workspace tests, not a claim that this CLI produced those images or that the corresponding models are currently available to every API account. Each case separates observed settings from suggested API reproduction steps. Images are served from the FusionAI website, keeping the repository lightweight.

## Costs and request handling

`models` is read-only; generation and editing use your FusionAI account and may incur charges. `--confirm-paid` authorizes one request; it does not retry it. If a POST times out, its outcome may be unknown: check the request record before submitting again. Keep the returned request ID when contacting support. If local saving fails after generation, preserve that ID instead of regenerating automatically.

## Development

```bash
npm test
npm run check
```

Tests use local fixtures and mocked API responses; CI does not need API credentials or make paid calls. Node's built-in test runner is the only test framework.

## License and support

Source code and repository documentation: [MIT](LICENSE). Linked example images and FusionAI trademarks retain their respective rights; see [media attribution](docs/MEDIA.md). Support: [GitHub Issues](https://github.com/cjbjjob-sketch/fusionai-skills/issues) or server@fusionai.tv. Please remove credentials and private references from issue reports.
