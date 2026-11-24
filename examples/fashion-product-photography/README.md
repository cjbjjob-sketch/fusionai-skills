# AI clothing + model photo composite: two-reference product photography

Combine a full-length fictional adult model reference with an original synthetic green-dress reference. The person photo supplies identity, pose and framing; the dress photo supplies garment construction.

[All examples](../README.md) · [Full FusionAI workflow](https://www.fusionai.tv/examples/garment-and-model-composite)

## Observed test settings

| Field | Recorded value |
| --- | --- |
| Source | FusionAI Image Studio, not this repository's CLI |
| Test date | 2026-11-21 |
| Model | GPT Image 2.6 Sunburst |
| Selected ratio / resolution / quality | 2:3 / 1K / high |
| Received output | 832 × 1248, PNG |

### Model reference

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/gpt26-fitting-model.webp" alt="Model reference: AI clothing + model photo composite: two-reference product photography" width="360">

### Garment reference

<img src="https://www.fusionai.tv/home/generated/seo-evidence/fashion-source-v1.webp" alt="Garment reference: AI clothing + model photo composite: two-reference product photography" width="360">

### Composite result

<img src="https://www.fusionai.tv/tutorial-media/image-model-tests/gpt26-garment-composite.webp" alt="Composite result: AI clothing + model photo composite: two-reference product photography" width="360">

## Original submitted prompt

```text
Use reference 1 as the person and base photo. Keep her face, hair, stance, camera angle, framing, shoes and studio lighting. Use reference 2 only for the forest-green linen dress. Replace her outfit with this dress, preserving its square neckline, wide straps, narrow matching belt, rectangular buckle and flared hem. Let fabric and shadows follow the original pose. Show the complete garment. No added jewelry, branding or text.
```

The prompt is also available as [prompt.txt](prompt.txt). [Sanitized test evidence](evidence.json) preserves selected settings separately from received dimensions. WebP display assets may be resized versions of original outputs.

## Review before use

- The published result visually retains the frontal stance, shoes and studio framing.
- Check the square neckline, broad straps, narrow belt and rectangular buckle against the garment reference.
- The model invents folds around the body. This is a composition demonstration, not a measurement of real sizing or fabric drape.

## Reproduce a similar workflow

For API reproduction, discover a currently available GPT Images editing model. Supply the model photo as the first --image and garment photo as the second --image. The workspace model in this case may not appear in the API catalog.

Start with the [CLI quick start](../../README.md#quick-start), run `models`, then prepare a dry run with `--prompt-file examples/fashion-product-photography/prompt.txt` and your own local reference files. The CLI does not fetch these examples or upload your images during a dry run. A real edit uploads your chosen reference images and is billable. Exact outputs are not deterministic.

## 中文操作要点

服装图和模特图分别负责衣服结构与人物身份、姿态。上架前检查领口、肩带、腰带、裙摆以及面部与手部，不将合成图当作真实尺码或面料垂坠证据。

[在 FusionAI 中了解图像创作](https://www.fusionai.tv/zh/studio/ai-image) · [媒体来源与使用说明](../../docs/MEDIA.md)
