import { promises as fs } from 'fs';
import path from 'path';
import { Task, TasksData } from './types';

// 任务文件路径
const TASKS_FILE_PATH = path.join(__dirname, 'tasks.json');

/**
 * 读取任务列表，自动清理超过15天的软删除任务
 * @returns 任务列表
 */
export async function getTasks(): Promise<Task[]> {
  const tasksData = await readTasksFile();
  
  // 检查是否有超过15天的软删除任务需要清理
  const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
  const originalLength = tasksData.tasks.length;
  
  // 过滤掉超过15天的软删除任务
  tasksData.tasks = tasksData.tasks.filter(task => 
    !(task.status === 'deleted' && task.deletedAt !== null && task.deletedAt < fifteenDaysAgo)
  );
  
  // 如果有任务被清理，则更新文件
  if (tasksData.tasks.length !== originalLength) {
    tasksData.metadata.lastUpdated = Date.now();
    await writeTasksFile(tasksData);
  }
  
  // 返回非删除状态的任务
  return tasksData.tasks.filter(task => task.status !== 'deleted');
}

/**
 * 添加新任务
 * @param task 要添加的任务
 * @returns 添加后的任务
 */
export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'deletedAt'>): Promise<Task> {
  const tasksData = await readTasksFile();
  
  // 生成新ID（使用当前时间戳）
  const newTask: Task = {
    ...task,
    id: Date.now(),
    createdAt: Date.now(),
    deletedAt: null
  };
  
  tasksData.tasks.push(newTask);
  tasksData.metadata.lastUpdated = Date.now();
  
  await writeTasksFile(tasksData);
  
  return newTask;
}

/**
 * 更新任务
 * @param task 要更新的任务（需要包含id）
 * @returns 更新后的任务 | null (如果任务不存在或已删除)
 */
export async function updateTask(task: Task): Promise<Task | null> {
  const tasksData = await readTasksFile();

  const index = tasksData.tasks.findIndex(t => t.id === task.id);
  
  // 1. 任务不存在
  if (index === -1) {
    return null; 
  }

  // 2. 新增逻辑：禁止修改已软删除的任务
  if (tasksData.tasks[index]!.status === 'deleted') {
    return null; // 或者抛出特定错误
  }
  
  // 保留原始的createdAt和deletedAt
  const updatedTask = {
    ...task,
    createdAt: tasksData.tasks[index]!.createdAt,
    deletedAt: null // 修改任务时，通常不需要保留 deletedAt，除非是特殊的“恢复”操作
  };
  
  tasksData.tasks[index] = updatedTask;
  tasksData.metadata.lastUpdated = Date.now();
  
  await writeTasksFile(tasksData);
  
  return updatedTask;
}

/**
 * 删除任务（软删除）
 * @param id 任务ID
 * @returns 是否成功删除
 */
export async function deleteTask(id: number): Promise<boolean> {
  const tasksData = await readTasksFile();
  
  const taskIndex = tasksData.tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) {
    return false; // 任务不存在
  }
  
  if (!tasksData.tasks) {
    return false;
  }
  if (tasksData.tasks[taskIndex]!.status === 'deleted') {
    return false; // 任务已删除
  }
  // 软删除：更新状态和deletedAt时间
  tasksData.tasks[taskIndex]!.status = 'deleted';
  tasksData.tasks[taskIndex]!.deletedAt = Date.now();
  
  tasksData.metadata.lastUpdated = Date.now();
  
  await writeTasksFile(tasksData);
  
  return true;
}

/**
 * 读取任务文件
 * @returns 任务数据
 */
async function readTasksFile(): Promise<TasksData> {
  try {
    const fileContent = await fs.readFile(TASKS_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // 如果文件不存在，返回默认结构
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        tasks: [],
        metadata: {
          version: '1.0',
          lastUpdated: Date.now()
        }
      };
    }
    throw error;
  }
}

/**
 * 写入任务文件
 * @param tasksData 任务数据
 */
async function writeTasksFile(tasksData: TasksData): Promise<void> {
  await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasksData, null, 2));
}