import { getOrCreateToken } from '../utils/auth';

export interface ChatResponse {
  data: string;
}

export const sendMessageStream = async (
  text: string, 
  onChunk: (chunk: string) => void
) => {
  const token = getOrCreateToken();

  const response = await fetch('https://spark-news.ru/api/v1/chat/send_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, token }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Ошибка установления стрим-запроса');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    
    onChunk(chunkValue);
  }
};