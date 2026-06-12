import { useState, useCallback, useRef } from 'react';
import type { AIConfig } from '../types/api';
import type { BaziResult } from '../types/bazi';
import { SYSTEM_PROMPT, buildUserMessage } from '../constants/prompt';

export function useAI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async (baziResult: BaziResult, config: AIConfig) => {
    if (!config.apiKey.trim()) {
      setError('请先配置 API Key');
      return;
    }

    setLoading(true);
    setResult('');
    setError(null);

    abortRef.current = new AbortController();

    try {
      const userMessage = buildUserMessage(baziResult);
      const endpoint = config.endpoint.replace(/\/$/, '');

      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: config.model,
          stream: true,
          temperature: 0.7,
          max_tokens: 4000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API请求失败 (${response.status}): ${errText}`);
      }

      if (!response.body) {
        throw new Error('响应体为空');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              setResult(prev => prev + delta);
            }
          } catch {
            // 跳过无法解析的行
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        // 用户主动中断
      } else {
        const msg = e instanceof Error ? e.message : '请求失败';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const clear = useCallback(() => {
    setResult('');
    setError(null);
  }, []);

  return { result, loading, error, analyze, stop, clear };
}
