import express from 'express';
import cors from 'cors';
import routes from './routes';
import { LLMService } from './llmService';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

const wss = new WebSocketServer({ port: 8080 });
const chatMap = new WeakMap();   // ws -> messages[]

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api', routes);

// 根路径路由
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用待办事项API' });
});

wss.on('connection', ws => {
  chatMap.set(ws, []);           // 新会话
  const llmObject = new LLMService();
  ws.on('message', async (data: string) => {
    const prompt = data.toString();
    const history = chatMap.get(ws);
    history.push({ role: 'user', content: prompt });

    const answers = await llmObject.send(prompt);
    if (answers) {
      for (const answer of answers) {
        history.push({ role: 'assistant', content: answer });
        ws.send(answer);
      }
    }
  });

  ws.on('close', () => chatMap.delete(ws));
});
// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理中间件
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

export default app;