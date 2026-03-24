import { apiFetch } from '../api/client';

export const getAIResponse = async (topic, pathContext = "") => {
  try {
    const data = await apiFetch('/api/graph/generate', {
      method: 'POST',
      body: { topic, pathContext }
    });
    return data;
  } catch (error) {
    console.error("Graph Service Error:", error);
    const isInitial = !pathContext;
    return isInitial ? { root: { id: 'root', label: topic, desc: 'Error generating graph' }, children: [] } : { nodes: [] };
  }
};
