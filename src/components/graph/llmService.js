import { apiFetch } from '../../api/client';

export const getAIResponse = async (topic, pathContext = "") => {
  const isInitial = !pathContext;
  try {
    const data = await apiFetch('/api/graph/generate', {
      method: 'POST',
      body: { topic, pathContext }
    });


    return data;
  } catch (error) {
    console.error("LLM Service Error:", error);
    return isInitial ? { root: { id: 'root', label: topic, desc: 'Error generating graph' }, children: [] } : { nodes: [] };
  }
};
