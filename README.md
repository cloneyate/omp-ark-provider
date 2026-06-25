# omp-ark-provider

Ark (ByteDance Volcengine) coding plan provider plugin for [omp](https://github.com/oh-my-pi/oh-my-pi).

Provides 12 pinned models with official context windows and token limits, sourced from the Ark coding gateway's `/models` endpoint and vendor documentation.

## Models

| Model | Context | Max Output | Images |
|---|---|---|---|
| `ark-code-latest` | 262K | 131K | no |
| `doubao-seed-2.0-code` | 262K | 131K | yes |
| `doubao-seed-2.0-pro` | 262K | 131K | yes |
| `doubao-seed-2.0-lite` | 262K | 131K | yes |
| `doubao-seed-code` | 262K | 33K | yes |
| `minimax-m2.7` | 205K | 131K | no |
| `minimax-m3` | 1M | 128K | yes |
| `glm-5.2` | 1M | 131K | no |
| `deepseek-v4-flash` | 1M | 393K | no |
| `deepseek-v4-pro` | 1M | 393K | no |
| `kimi-k2.6` | 262K | 33K | yes |
| `kimi-k2.7-code` | 262K | 33K | yes |

## Install

```bash
omp plugin install github:cloneyate/omp-ark-provider
```

Or link locally for development:

```bash
git clone git@github.com:cloneyate/omp-ark-provider.git
cd omp-ark-provider
omp plugin link .
```

## Configure

Run `/setup providers` in omp, select **Ark Coding Plan**, and follow the prompts:

1. Open the Ark console to get your API key
2. Enter the base URL (default: `https://ark.cn-beijing.volces.com/api/coding/v3`)
3. Paste your API key

The base URL is persisted to `~/.omp/ark-provider-config.json`. The API key is stored in omp's credential store.

## Usage

```bash
omp --model ark/doubao-seed-2.0-pro -p "Hello"
```

Or switch in-session with `/model ark/doubao-seed-2.0-pro`.
