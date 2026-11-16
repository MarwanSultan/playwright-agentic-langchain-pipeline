import { ChatOpenAI } from '@langchain/openai';

export const llm = new ChatOpenAI({
  model: 'gpt-6.1-terra',
  temperature: 0,
});
