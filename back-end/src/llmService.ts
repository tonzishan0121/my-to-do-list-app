import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool, ChatCompletion } from "openai/resources/chat";
import { Task } from "./types";
import { addTask, deleteTask, getTasks, updateTask } from "./services";
const API_KEY = "sk-9da54aa0777e45a6b7fe834d2d2b5560";

const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.deepseek.com"
});
const tools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "getTasks",
            description: "获取待办事项列表",
            parameters: {
                type: "object",
                properties: {},
            }
        }
    },
    {
        type: "function",
        function: {
            name: "updateTask",
            description: "更新一个任务",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "任务id",
                    },
                    content: {
                        type: "string",
                        description: "任务内容",
                    },
                    description: {
                        type: "string",
                        description: "任务描述",
                    },
                    category: {
                        type: "string",
                        description: "任务分类，可选值：工作,个人,购物,其他。用户也可自己增加自定义的新任务分类，如果用户未指定且无法归类到已有类中，默认为其他。",
                    },
                    status: {
                        type: "string",
                        description: "任务状态，可选值仅限：active (进行中), completed (已完成), deleted (已删除)。",
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "addTask",
            description: "添加一个任务",
            parameters: {
                type: "object",
                properties: {
                    content: {
                        type: "string",
                        description: "任务内容",
                    },
                    description: {
                        type: "string",
                        description: "任务描述",
                    },
                    category: {
                        type: "string",
                        description: "任务分类，可选值：工作,个人,购物,其他。用户也可自己增加自定义的新任务分类，如果用户未指定且无法归到已有类中，默认为其他。",
                    },
                    status: {
                        type: "string",
                        description: "任务状态，可选值仅限：active (进行中), completed (已完成), deleted (已删除)。一般情况下默认为active (进行中)",
                    }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteTask",
            description: "删除一个任务",
            parameters: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "任务id",
                    }
                }
            }
        }
    }
]
const msg: ChatCompletionMessageParam[] = [{
    role: "system", content: `
    你是一个待办事项管理助手，名叫缇宝，旨在帮助用户高效地管理任务。

你的核心职责是理解用户的自然语言指令，并协助用户管理待办事项列表。

**任务数据结构（请严格遵守）：**
- id: 任务的唯一标识（时间戳整数）
- content: 任务标题（必填）
- description: 任务详细描述（选填）
- category: 任务分类，可选值：工作,个人,购物,其他。用户也可自己增加自定义的新任务分类，如果用户未指定，默认为其他。
- status: 任务状态，可选值仅限：active (进行中), completed (已完成), deleted (已删除)。
- createdAt: 任务创建时间（时间戳整数）
- deletedAt: 任务删除时间（时间戳整数），如果任务未删除，则为 null，采用的是软删除，执行删除操作时会记录删除时间，如果当前时间-任务创建时间 > 15天，则任务会被永久删除。

**工作流程（请严格遵守）：**
1.你需要表现得像是一个古灵精怪的小助理，需要先跟用户对“暗号”："deepseek"，你可以进行三次提示，但是请不要直接说出暗号，直到用户准确的猜出暗号，否则将无法进入下面的工作流程。
2.当用户首次猜出暗号时，你的回复中必须包含：“恭喜答对！芝麻开门~”。
3.当用户没有明确告诉你需要进行修改或删除时，而完成用户的任务需要进行修改或删除的方法，需要用户确认。例如，用户说：“我这周末要加班。”，而时间表这周末已经有去钓鱼的任务，你需要询问用户：“是否删除这周末去钓鱼的任务？”。当用户确认删除，则返回删除成功，否则返回删除失败。
4.当用户已确定的操作，可以直接执行并直接返回结果。例如，用户说：“今天要写周报。”，则直接返回“已添加任务：今天要写周报”。
5.查询方法可直接调用，无需询问。

**交互规则：**
1. 意图识别：准确识别用户想要添加、修改、查询还是删除任务。
2. 参数提取：从用户的口语化表达中提取关键参数。例如：“把周报写完” -> content="把周报写完", category="工作"。
3. 分类映射：自动将用户的模糊词汇映射到标准 category。例如：“买东西” -> 购物，“生活琐事” -> 个人，如果用户没有明确指明创建新任务分类，且当前所有类别都无法涵盖新事项的分类，则默认为其他。
4. 提取主体：要处理好用户的需求，content在表述清楚需要做的事情的前提下尽可能简洁，冗余信息与说明放到description中。
5. 回复风格：保持简洁、直接。不要说太多客套话，直接确认操作或展示结果。

请随时准备根据用户指令调用相应的工具函数来操作任务列表。`}];


export class LLMService {
    constructor(public chatHistory = msg) { }

    async defaultChat() {
        const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            tools: tools,
            messages: this.chatHistory
        });
        if (!completion.choices[0]?.message) {
            return null;
        }
        this.chatHistory.push(completion.choices[0]?.message);
        return completion.choices[0]?.message.content
    }

    async send(prompt: string) {
        const res: string[] = [];
        this.chatHistory.push({ role: "user", content: prompt });
        const completion = await client.chat.completions.create({
            model: "deepseek-chat",
            tools: tools,
            messages: this.chatHistory, 
        });
        if (!completion.choices[0]?.message) {
            return null;
        }
        res.push(completion.choices[0]?.message.content!);
        this.chatHistory.push(completion.choices[0]?.message);
        if (completion.choices[0]?.message.tool_calls) {
            const useToolsRes = await this.useTools(completion);
            for (let res of useToolsRes) {
                this.chatHistory.push({ "role": "tool", "tool_call_id": res.id, "content": JSON.stringify(res) })
            }
            const defaultRes = await this.defaultChat();
            if (defaultRes) {
                res.push(defaultRes);
            }
        }
        return res;
    }

    async useTools(completion: ChatCompletion) {
        const toolCall = completion.choices[0]?.message.tool_calls!;
        const funcsRes = [];
        for (const func of toolCall) {
            if (func.type !== "function") {
                continue;
            }
            switch (func.function.name) {
                case "addTask": {
                    const task = JSON.parse(func.function.arguments) as Omit<Task, 'id' | 'createdAt' | 'deletedAt'>;
                    const res = await addTask(task);
                    funcsRes.push({ content: `已添加任务：${res.content}, id: ${res.id}`, id: func.id });
                    break;
                }

                case "updateTask": {
                    const task = JSON.parse(func.function.arguments) as Task;
                    const res = await updateTask(task);
                    if (!res) {
                        funcsRes.push({ content: `修改任务失败，可能是任务不存在或者已删除，任务id: ${task.id}`, id: func.id });
                        break;
                    }
                    funcsRes.push({ content: `已修改任务：${res.content}，任务id: ${task.id}`, id: func.id });
                    break;
                }

                case "deleteTask": {
                    const task = JSON.parse(func.function.arguments);
                    const res = await deleteTask(task.id);
                    if (!res) {
                        funcsRes.push({ content: `删除任务失败，可能是任务不存在或者已删除，任务id: ${task.id}`, id: func.id });
                        break;
                    }
                    funcsRes.push({ content: `已删除目标任务，任务id: ${task.id}`, id: func.id });
                    break;
                }

                case "getTasks": {
                    const res = await getTasks();
                    funcsRes.push({ content: `已获取所有任务列表`, tasks: res, id: func.id });
                    break;
                }

                default: {
                    return [{ content: `调用未知操作：${func.function.name}`, id: func.id }];
                }
            }
        }
        return funcsRes;
    }
}

