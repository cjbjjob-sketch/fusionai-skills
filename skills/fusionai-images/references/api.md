# FusionAI international API client reference

Base: `https://www.fusionai.tv`. Authentication: `Authorization: Bearer $FUSIONAI_API_KEY`.
Authoritative documentation: [FusionAI Open API](https://www.fusionai.tv/openapi/docs).

## Implemented operations

| Command | API operation | Parameters |
| --- | --- | --- |
| `models` | `GET /v1/models` | Authenticated current catalog and prices |
| `generate` with GPT Images | `POST /v1/images/generations` JSON | model, prompt, n=1, size, resolution, quality, PNG output |
| `edit` with GPT Images | `POST /v1/images/edits` multipart | model, prompt, image[], optional PNG mask, size, resolution, quality |
| `generate` / `edit` with Gemini | `POST /v1beta/models/{model}:generateContent` | Text, local inline image parts, IMAGE modality, aspectRatio and imageSize |

The live authenticated model response selects the protocol. This release limits references to four files, each at most 20 MiB. It requests one image with GPT Images. Response and download limits are 64 MiB. The API's own limits and account access also apply.

`--quality` is sent as provided: select a supported value from the catalog. The client does not reinterpret UI quality or resolution labels. Workspace GIF/WebP/JPEG controls are not assumed to be part of the public API; GPT API requests use PNG in this release.

## CLI options

Common: `--model`, `--prompt` or `--prompt-file`, `--resolution`, `--output-dir`, `--timeout` (seconds, default 600), `--dry-run`, `--confirm-paid`.

GPT: `--size`, `--quality`; edits also accept repeatable `--image` and optional `--mask`.
Gemini: `--aspect-ratio`; repeatable `--image` for editing. GPT-specific size/quality/mask flags are rejected.

Dry runs do not discover models or validate live capabilities. For real calls the selected exact ID must appear in `/v1/models`, and its protocol must be implemented. No model alias is silently rewritten.

## Outputs and errors

Images API `data[].b64_json` / `data[].url` and Gemini `candidates[].content.parts[].inlineData` are supported. Downloads carry no API Authorization header, require public HTTPS addresses, and revalidate redirects. PNG/JPEG/WebP/GIF signatures determine saved extensions.

| Failure | Action |
| --- | --- |
| Missing key / 401 | Set the environment variable; check account approval and key status |
| 402 | Check account balance |
| 403 / model missing | Refresh the catalog; check allowed models, protocol and pricing |
| 429 | Respect server limits; do not run an automatic paid retry loop |
| Timeout / 5xx | Outcome may be uncertain; inspect request records before another POST |
| Local save failure | Preserve request ID and recover the existing result |

The tool prints concise errors with credentials redacted. Do not paste full response bodies, private reference images, signed result links or bearer tokens into public issues.
