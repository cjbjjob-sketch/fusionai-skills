# AI product background replacement: preserve a backpack while changing the scene

Place an ivory canvas backpack on an oak bench. The first reference defines the product; the second defines the setting and window light. This separates product identity from scene composition.

[All examples](../README.md) · [Full FusionAI workflow](https://www.fusionai.tv/models/nano-banana-2#section-2)

## Observed test settings

| Field | Recorded value |
| --- | --- |
| Source | FusionAI Image Studio, not this repository's CLI |
| Test date | 2026-11-19 |
| Model | Nano Banana 2 |
| Selected ratio / resolution / quality | 4:5 / 1K / auto |
| Received output | 928 × 1152, JPEG |

### Product reference

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/backpack-original-reference.jpg" alt="Product reference: AI product background replacement: preserve a backpack while changing the scene" width="360">

### Scene reference

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/window-scene-reference.jpg" alt="Scene reference: AI product background replacement: preserve a backpack while changing the scene" width="360">

### Generated composition

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/backpack-composite.webp" alt="Generated composition: AI product background replacement: preserve a backpack while changing the scene" width="360">

## Original submitted prompt

```text
Create a single realistic product photograph using both references in their upload order. Reference 1 supplies the product only: the ivory canvas backpack with a curved top, short carry handle, two top zipper pulls, one front zip pocket and the visible right shoulder strap. Reference 2 supplies the scene and lighting only: the oak bench, cool sage plaster, left window light and restrained shadow. Place the backpack on the bench, keep all product edges visible and add a plausible contact shadow. Do not copy the white background from reference 1. Do not add another bag, new hardware, text or decorative props.
```

The prompt is also available as [prompt.txt](prompt.txt). [Sanitized test evidence](evidence.json) preserves selected settings separately from received dimensions. WebP display assets may be resized versions of original outputs.

## Review before use

- Compare both zipper pulls, the top handle, front pocket and visible shoulder strap at full size.
- Check contact shadow and bag-to-bench perspective; a convincing scene can still contain hardware changes.
- The observed output was 928 × 1152 pixels for a requested 4:5 setting. Do not claim that the received dimensions are an exact 4:5 match; crop deliberately if the delivery channel requires it.

## Reproduce a similar workflow

For a similar API workflow, discover a gemini-generate-content image model. Run edit with repeated --image references in the same order and --aspect-ratio 4:5. This is a suggested API reproduction, not evidence that the CLI created the displayed result.

Start with the [CLI quick start](../../README.md#quick-start), run `models`, then prepare a dry run with `--prompt-file examples/product-background-replacement/prompt.txt` and your own local reference files. The CLI does not fetch these examples or upload your images during a dry run. A real edit uploads your chosen reference images and is billable. Exact outputs are not deterministic.

## 中文操作要点

商品参考图决定背包轮廓、提手、口袋与肩带，场景图决定长凳、窗光和背景。实际返回尺寸与所选比例存在差异，交付时应重新核对，不直接宣称完全一致。

[在 FusionAI 中了解图像创作](https://www.fusionai.tv/zh/studio/ai-image) · [媒体来源与使用说明](../../docs/MEDIA.md)
