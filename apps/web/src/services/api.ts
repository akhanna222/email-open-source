const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18000';

export interface NodeSchema {
  type: string;
  name: string;
  category: string;
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface Workflow {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  description?: string;
  metadata?: any;
}

export interface SampleWorkflow {
  id: string;
  name: string;
  description: string;
  metadata: any;
  filename: string;
}

export const api = {
  // Fetch available node schemas from backend
  async getNodeSchemas(): Promise<NodeSchema[]> {
    const response = await fetch(`${API_BASE_URL}/schemas/nodes`);
    const data = await response.json();
    return data.nodes || [];
  },

  // Save workflow
  async saveWorkflow(workflow: Workflow): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });
    return response.json();
  },

  // Update workflow
  async updateWorkflow(workflowId: string, workflow: Workflow): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });
    return response.json();
  },

  // Load workflows
  async getWorkflows(): Promise<Workflow[]> {
    const response = await fetch(`${API_BASE_URL}/workflows`);
    const data = await response.json();
    return data.workflows || [];
  },

  // Load specific workflow
  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`);
    return response.json();
  },

  // Delete workflow
  async deleteWorkflow(workflowId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/workflows/${workflowId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get sample workflows
  async getSampleWorkflows(): Promise<SampleWorkflow[]> {
    const response = await fetch(`${API_BASE_URL}/workflows/samples/list`);
    const data = await response.json();
    return data.samples || [];
  },

  // Load specific sample workflow
  async loadSampleWorkflow(sampleId: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/samples/${sampleId}`);
    const data = await response.json();
    return data.workflow;
  },
};
