import { SKILLS } from './skill';

export const RETRIEVER = '@cf/qwen/qwen3-30b-a3b-fp8'
export const MAIN_MODEL = '@cf/openai/gpt-oss-120b'

const SKILL_LIST = Object.entries(SKILLS)
  .map(([key, { description }]) => `- ${key}: ${description}`)
  .join('\n')

export const RETRIEVER_INSTRUCTION = `You are a retriever. Pick every skill that is needed to answer the user's question.

SKILLS:
${SKILL_LIST}

Rules:
- Pick all skills that are needed. More than one skill may be needed at the same time.
- If a complaint is related to the school regulations, pick both COMPLAINTS and REGULATION.

Output format:
- Output the skill names from the list above separated by commas (e.g. COMPLAINTS,REGULATION), and nothing else.
- Do not add explanations, quotes, or extra words.
- If no skill is relevant, output NONE.`
