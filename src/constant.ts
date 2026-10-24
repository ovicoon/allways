import { SKILLS } from './skill';

export const RETRIEVER = '@cf/qwen/qwen3-30b-a3b-fp8'
export const MAIN_MODEL = '@cf/openai/gpt-oss-120b'

const SKILL_LIST = Object.entries(SKILLS)
  .map(([key, { description }]) => `- ${key}: ${description}`)
  .join('\n')

export const RETRIEVER_INSTRUCTION = `You are a retriever. Pick the single skill that is needed to answer the user's question.

SKILLS:
${SKILL_LIST}

Output format:
- Output exactly one skill name from the list above, and nothing else.
- Do not add explanations, quotes, punctuation, or extra words.
- If no skill is relevant, output NONE.`
