import { Router, Request, Response } from 'express';
import { getTasks, addTask, updateTask, deleteTask } from './services';
import { Task } from './types';

const router = Router();

// 获取任务列表
router.get('/tasks', async (_req: Request, res: Response) => {
  try {
    const tasks = await getTasks();
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: '获取任务列表失败' });
  }
});

// 添加新任务
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { content, description, category } = req.body;
    
    // 验证必需字段
    if (!content) {
      return res.status(400).json({ error: '任务内容不能为空' });
    }
    
    const newTask = await addTask({
      content,
      description: description || '',
      category: category || 'default',
      status: 'active'
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: '添加任务失败' });
  }
});

// 更新任务
router.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { content, description, category, status } = req.body;
    
    // 验证任务ID
    if (isNaN(taskId)) {
      return res.status(400).json({ error: '无效的任务ID' });
    }
    
    const existingTasks = await getTasks();
    const existingTask = existingTasks.find(task => task.id === taskId);
    
    if (!existingTask) {
      return res.status(404).json({ error: '任务不存在' });
    }
    
    const updatedTask: Task = {
      ...existingTask,
      content: content !== undefined ? content : existingTask.content,
      description: description !== undefined ? description : existingTask.description,
      category: category !== undefined ? category : existingTask.category,
      status: status !== undefined ? status : existingTask.status
    };
    
    const result = await updateTask(updatedTask);
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: '更新任务失败' });
    }
  } catch (error) {
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务（软删除）
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    
    // 验证任务ID
    if (isNaN(taskId)) {
      return res.status(400).json({ error: '无效的任务ID' });
    }
    
    const success = await deleteTask(taskId);
    
    if (success) {
      res.json({ message: '任务删除成功' });
    } else {
      res.status(404).json({ error: '任务不存在' });
    }
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' });
  }
});

export default router;