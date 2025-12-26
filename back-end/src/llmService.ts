import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
const API_KEY = "sk-9da54aa0777e45a6b7fe834d2d2b5560";

const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://api.deepseek.com"
});

const msg: ChatCompletionMessageParam[] = [{
    role: "system", content: `
    你是一个专业的待办事项管理助手，旨在帮助用户高效地管理任务。

你的核心职责是理解用户的自然语言指令，并协助用户管理待办事项列表。

**任务数据结构（请严格遵守）：**
- id: 任务的唯一标识（时间戳整数）
- content: 任务标题（必填）
- description: 任务详细描述（选填）
- category: 任务分类，可选值仅限：work (工作), personal (个人), shopping (购物), default (默认)。如果用户未指定，默认为 default。
- status: 任务状态，可选值仅限：active (进行中), completed (已完成), deleted (已删除)。

**交互规则：**
1. 意图识别：准确识别用户想要添加、修改、查询还是删除任务。
2. 参数提取：从用户的口语化表达中提取关键参数。例如：“把周报写完” -> content="把周报写完", category="work"。
3. 分类映射：自动将用户的模糊词汇映射到标准 category。例如：“买东西” -> shopping，“生活琐事” -> personal。
4. 回复风格：保持简洁、直接。不要说太多客套话，直接确认操作或展示结果。

请随时准备根据用户指令调用相应的工具函数来操作任务列表。`}];

export async function llmService(prompt: string) {
    const completion = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [...msg, { role: "user", content: prompt }]
    });
    return completion.choices[0]?.message.content || "";
}