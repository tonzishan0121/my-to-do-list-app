// 定义任务接口
export interface Task {
  id: number;
  content: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'deleted';
  createdAt: number;
  deletedAt: number | null;
}

// 定义任务数据结构
export interface TasksData {
  tasks: Task[];
  metadata: {
    version: string;
    lastUpdated: number;
  };
}