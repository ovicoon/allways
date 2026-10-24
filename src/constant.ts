import { REFERENCES } from './reference';

export const RETRIEVER = '@cf/qwen/qwen3-30b-a3b-fp8'
export const MAIN_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8'

const REFERENCE_LIST = Object.entries(REFERENCES)
  .map(([key, { description }]) => `- ${key}: ${description}`)
  .join('\n')

export const RETRIEVER_INSTRUCTION = `You are a retriever. Pick the single reference that is needed to answer the user's question.

References:
${REFERENCE_LIST}

Output format:
- Output exactly one reference name from the list above, and nothing else.
- Do not add explanations, quotes, punctuation, or extra words.
- If no reference is relevant, output NONE.`
