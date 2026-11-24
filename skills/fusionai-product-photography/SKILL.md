---
name: fusionai-product-photography
description: Plan and review ecommerce product images with FusionAI, including clothing and model composition, product backgrounds and object removal. Use to define reference roles, write task-specific prompts and inspect product identity; not for general SEO writing.
---

# FusionAI Product Photography

Use this skill to turn a product-image task into a clear brief, prompt and inspection plan. It can be used without API credentials. It does not automatically submit generation requests.

## Reference roles

Establish what each uploaded image contributes: product identity, person identity/pose, scene/light, or composition. Explicitly list what must be preserved and what can change. For clothing + model composition, distinguish the garment reference from the model's identity and pose reference. Avoid transferring an unintended product, face, text or logo from the scene reference.

Write instructions around the provided product rather than inventing SKU details, dimensions, materials, certifications or marketing claims. If a reference is too small or obstructed to establish a critical detail, flag that limitation before promising exact preservation.

For concrete prompts, review the three [worked examples](references/workflows.md). These are existing workspace results, not guaranteed outcomes or current API capability declarations.

## Plan the deliverable

Identify the target use: catalog/main image, lifestyle image, detail crop or campaign concept. Select framing and background accordingly. Retain a clean source image and give every proposed variation a distinct purpose. Marketplace requirements should be checked against the target marketplace's current rules when producing listing-ready assets.

Structure the prompt as: reference roles → required invariants → allowed changes → scene/camera/light → exclusions. A product background edit should describe the new scene and contact shadow without inviting changes to hardware, packaging or labels.

## Review the result

Compare originals and outputs at full size. Check silhouette, color, material, logo and legible text, seams, zippers, jewelry chain attachments, anatomical contact, perspective and shadows. For garment compositions, inspect neckline, straps, belt, hem, drape, hands and face consistency.

Distinguish observed successes from defects and uncertainty. Preserve the original references. If one local detail is wrong, propose a targeted correction before regenerating the whole image. Exact packaging typography may require real label artwork or manual composition.

If the user asks for real generation, use their available FusionAI client or Image Studio. The separate `fusionai-images` skill is optional for API execution; its own model discovery and billable authorization rules apply. Do not assume video, bulk processing or a workspace-only model is available through the Open API.

Provide the actual prompt, selected references, chosen parameters and a concise inspection result. Never manufacture customer reviews, API execution evidence or performance figures.
