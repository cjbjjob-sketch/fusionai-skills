# AI object removal from a product photo: remove a prop, preserve the headphones

Remove only the orange cube and its shadow from a headphone product photograph. Keep the tabletop, product silhouette, earcup texture, camera angle and existing product shadow.

[All examples](../README.md) · [Full FusionAI workflow](https://www.fusionai.tv/models/gpt-image-2#section-3)

## Observed test settings

| Field | Recorded value |
| --- | --- |
| Source | FusionAI Image Studio, not this repository's CLI |
| Test date | 2026-11-19 |
| Model | GPT Image 2.5 Sunburst |
| Selected ratio / resolution / quality | 16:9 / 1K / high |
| Received output | 1280 × 720, PNG |

### Original product photo

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/headphones-original-reference.png" alt="Original product photo: AI object removal from a product photo: remove a prop, preserve the headphones" width="360">

### Edited result

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/headphone-edit.webp" alt="Edited result: AI object removal from a product photo: remove a prop, preserve the headphones" width="360">

## Original submitted prompt

```text
Edit the attached headphone photo. Remove only the small orange wooden cube on the right and its shadow. Reconstruct the exposed area with the surrounding warm ivory tabletop. Preserve the exact headphone silhouette, headband stitching, round earcups, tiny flecks on the front earcup, camera angle, crop, lighting, and the shadow under the headphones. Leave the right side empty. Do not add text, logos or props.
```

The prompt is also available as [prompt.txt](prompt.txt). [Sanitized test evidence](evidence.json) preserves selected settings separately from received dimensions. WebP display assets may be resized versions of original outputs.

## Review before use

- Inspect the right side for remnants of the cube, its shadow, smearing or repeated tabletop texture.
- Compare headband seams, earcup edges and tiny visible surface details to the original.
- For a stricter local edit, try a supported PNG mask covering only the prop and its shadow, then review the same preservation checks. The displayed test used a text-directed edit.

## Reproduce a similar workflow

Discover a currently published GPT Images editing model. Supply the original photo with --image. An optional --mask must be PNG; it is a separate proposed workflow, not an input used in this recorded example.

Start with the [CLI quick start](../../README.md#quick-start), run `models`, then prepare a dry run with `--prompt-file examples/object-removal/prompt.txt` and your own local reference files. The CLI does not fetch these examples or upload your images during a dry run. A real edit uploads your chosen reference images and is billable. Exact outputs are not deterministic.

## 中文操作要点

只消除右侧橙色方块及其阴影，保留耳机轮廓、缝线、耳罩纹理和机位。放大检查补出的桌面和产品边缘，必要时再采用局部蒙版重绘。

[在 FusionAI 中了解图像创作](https://www.fusionai.tv/zh/studio/ai-image) · [媒体来源与使用说明](../../docs/MEDIA.md)
