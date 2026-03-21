import api from '../lib/axios';

export interface BackendNode {
  id: string;
  label: string;
  type: string;
}

export interface BackendEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphResponse {
  nodes: BackendNode[];
  edges: BackendEdge[];
}

export const getGraphData = async (): Promise<GraphResponse> => {
  const response = await api.get<GraphResponse>('/graph/co-occurrences');
  return response.data;
};