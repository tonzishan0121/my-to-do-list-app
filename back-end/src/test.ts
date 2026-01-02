import { LLMService } from "./llmService";
import { getTasks, addTask, deleteTask, updateTask } from "./services";
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const iter = async ()=>rl[Symbol.asyncIterator]();
const line = async ()=> (await (await iter()).next()).value;
async function testLLM() {
  const llm = new LLMService();
  const completion = await llm.send("我猜暗号是：deepseek。");
  console.log(completion);
  let msg;
  while (msg = await line()) {
    console.log(await llm.send(msg));
  }
  console.log(llm.chatHistory);
}

async function testGetTasks() {
  const tasks = await getTasks();
  console.log(tasks);
}

async function testAddTask() {
  const task = await addTask({
    content: '测试任务',
    category: '测试',
    description: '这是一个测试任务',
    status: 'active',
  });
  console.log(task);
}

async function testDeleteTask() {
  const task = await deleteTask(1766923758853);
  console.log(task);
}

async function testUpdateTask() { 
  const task = await updateTask({
    id: 1767324121517,
    description: '我不测试了',
    status: 'active',
  });
  console.log(task);
}
testLLM();

