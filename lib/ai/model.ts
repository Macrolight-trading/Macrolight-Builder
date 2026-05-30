import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/** Default chat model — Meta Llama 3.1 8B via Vercel AI Gateway (paid credits). */
export const DEFAULT_CHAT_MODEL = "meta/llama-3.1-8b";

/** Default onboarding model — Claude Sonnet 4.6 via Vercel AI Gateway. */
export const DEFAULT_ONBOARDING_MODEL = "anthropic/claude-sonnet-4.6";

const OPENAI_GATEWAY_MODELS = {
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4o": "openai/gpt-4o",
} as const;

export type OpenAIModelId = keyof typeof OPENAI_GATEWAY_MODELS;

function getGateway() {
  const gatewayApiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  return createGateway(
    gatewayApiKey ? { apiKey: gatewayApiKey } : undefined,
  );
}

/**
 * Site widget chat route.
 * Uses AI_GATEWAY paid credits. Override with AI_CHAT_MODEL.
 */
export function getChatModel(): LanguageModel {
  const modelId =
    process.env.AI_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
  return getGateway()(modelId);
}

/**
 * Onboarding assistant chat route.
 * Uses AI_GATEWAY paid credits. Override with AI_ONBOARDING_MODEL.
 */
export function getOnboardingModel(): LanguageModel {
  const modelId =
    process.env.AI_ONBOARDING_MODEL?.trim() || DEFAULT_ONBOARDING_MODEL;
  return getGateway()(modelId);
}

/**
 * Structured generation (audit content plans, etc.).
 * Prefers direct OpenAI when OPENAI_API_KEY is set, otherwise gateway.
 */
export function getLanguageModel(
  model: OpenAIModelId = "gpt-4o",
): LanguageModel {
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiApiKey) {
    const openai = createOpenAI({ apiKey: openaiApiKey });
    return openai(model);
  }

  return getGateway()(OPENAI_GATEWAY_MODELS[model]);
}
