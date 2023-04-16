import { Configuration, OpenAIApi } from 'openai';
import { createParser } from 'eventsource-parser';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  baseOptions: {},
});
// 开发环境需要代理
// if (process.env.NODE_ENV === 'development') {
//   configuration.baseOptions.proxy = {
//     host: '127.0.0.1',
//     port: 7890,//这里的端口根据你的软件设置
//   };
// }

const openai = new OpenAIApi(configuration);

export async function POST(req, res) {
  const { content } = await req.json();

  const prompt = `请帮我翻译以下文字：${content}`;

  const chatResponse = await openai.createChatCompletion(
    {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    },
    { responseType: 'stream' }
  );

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event) {
        let counter = 0;
        if (event.type === 'event') {
          const { data } = event;
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          const json = JSON.parse(data);
          const text = json.choices[0].delta?.content || '';
          if (counter < 2 && (text.match(/\n/) || []).length) {
            return;
          }
          const queue = encoder.encode(text);
          controller.enqueue(queue);
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of chatResponse.data) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
}
