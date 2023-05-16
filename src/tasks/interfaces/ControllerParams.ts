interface Task {
  content: string;
}

export interface CreateTaskProps {
  tasks: Task[];
}

export interface DeleteTaskProps {
  taskId: string;
}
