export interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
