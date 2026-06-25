import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// ── Persistent config ────────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3";
const CONFIG_PATH = join(homedir(), ".omp", "ark-provider-config.json");

interface ArkConfig {
	baseUrl: string;
}

function readArkConfig(): ArkConfig {
	try {
		if (existsSync(CONFIG_PATH)) {
			const parsed = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
			if (parsed.baseUrl && typeof parsed.baseUrl === "string") {
				return { baseUrl: parsed.baseUrl.trim() };
			}
		}
	} catch {
		// corrupt or missing → use default
	}
	return { baseUrl: DEFAULT_BASE_URL };
}

function saveArkConfig(config: ArkConfig): void {
	const dir = join(homedir(), ".omp");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
}

// ── Pinned models ────────────────────────────────────────────────────

const ZERO_COST = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

/**
 * Pinned Ark models with official parameters.
 *
 * Context windows and max output tokens are sourced from the Ark coding
 * gateway's own `/models` `token_limits` (authoritative for this endpoint),
 * cross-checked against each vendor's public model docs.
 */
const PINNED_MODELS = [
	{
		id: "ark-code-latest",
		name: "Ark Code Latest",
		reasoning: true,
		input: ["text"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 131072,
	},
	{
		id: "doubao-seed-2.0-code",
		name: "Doubao Seed 2.0 Code",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 131072,
	},
	{
		id: "doubao-seed-2.0-pro",
		name: "Doubao Seed 2.0 Pro",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 131072,
	},
	{
		id: "doubao-seed-2.0-lite",
		name: "Doubao Seed 2.0 Lite",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 131072,
	},
	{
		id: "doubao-seed-code",
		name: "Doubao Seed Code",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 32768,
	},
	{
		id: "minimax-m2.7",
		name: "MiniMax M2.7",
		reasoning: true,
		input: ["text"],
		cost: ZERO_COST,
		contextWindow: 204800,
		maxTokens: 131072,
	},
	{
		id: "minimax-m3",
		name: "MiniMax M3",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 1000000,
		maxTokens: 128000,
	},
	{
		id: "glm-5.2",
		name: "GLM-5.2",
		reasoning: true,
		input: ["text"],
		cost: ZERO_COST,
		contextWindow: 1000000,
		maxTokens: 131072,
	},
	{
		id: "deepseek-v4-flash",
		name: "DeepSeek V4 Flash",
		reasoning: true,
		input: ["text"],
		cost: ZERO_COST,
		contextWindow: 1048576,
		maxTokens: 393216,
	},
	{
		id: "deepseek-v4-pro",
		name: "DeepSeek V4 Pro",
		reasoning: true,
		input: ["text"],
		cost: ZERO_COST,
		contextWindow: 1048576,
		maxTokens: 393216,
	},
	{
		id: "kimi-k2.6",
		name: "Kimi K2.6",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 32768,
	},
	{
		id: "kimi-k2.7-code",
		name: "Kimi K2.7 Code",
		reasoning: true,
		input: ["text", "image"],
		cost: ZERO_COST,
		contextWindow: 262144,
		maxTokens: 32768,
	},
];

// ── Extension entry point ────────────────────────────────────────────

export default function arkProvider(pi: ExtensionAPI) {
	const config = readArkConfig();

	pi.registerProvider("ark", {
		name: "Ark Coding Plan",
		baseUrl: config.baseUrl,
		api: "openai-completions",
		compat: {
			supportsDeveloperRole: false,
			supportsReasoningEffort: false,
			maxTokensField: "max_tokens",
		},
		models: PINNED_MODELS,

		// Interactive login: base URL → API key
		oauth: {
			name: "Ark Coding Plan",

			async login(callbacks) {
				// Step 1 — show the user where to get their API key
				callbacks.onAuth({
					url: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
					instructions:
						"Create or copy your API key from the Ark console. You can customize the base URL in the next step.",
				});

				// Step 2 — ask for base URL (pre-filled with default)
				const baseUrl = await callbacks.onPrompt({
					message: "Ark base URL",
					placeholder: DEFAULT_BASE_URL,
					allowEmpty: true,
				});

				// Step 3 — ask for API key
				const apiKey = await callbacks.onPrompt({
					message: "Ark API key",
					placeholder: "Paste your API key...",
				});

				// Step 4 — persist base URL if it differs from current
				const finalBaseUrl = baseUrl.trim() || DEFAULT_BASE_URL;
				if (finalBaseUrl !== config.baseUrl) {
					saveArkConfig({ baseUrl: finalBaseUrl });
					callbacks.onProgress?.(
						`Base URL saved: ${finalBaseUrl}. Restart omp or run /reload to apply.`,
					);
				}

				return apiKey.trim();
			},
		},
	});
}
