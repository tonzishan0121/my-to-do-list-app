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
    const taskId = parseInt(req.params.id!, 10);
    
    if (isNaN(taskId)) {
      return res.status(400).json({ error: '无效的任务ID' });
    }
    
    const partialUpdate = req.body; 
    
    const taskToUpdate: Task = {
      id: taskId,
      ...partialUpdate,
      content: partialUpdate.content, 
      description: partialUpdate.description,
      category: partialUpdate.category,
      status: partialUpdate.status,
      createdAt: 0, 
      deletedAt: null 
    };

    // 直接调用 updateTask，它内部会处理读取和检查
    const result = await updateTask(taskToUpdate);
    
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: '任务不存在或已被删除' });
    }
  } catch (error) {
    console.error(error); // 打印错误日志方便调试
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务（软删除）
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      throw Error('无任务ID')
    }
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