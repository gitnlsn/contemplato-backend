interface WithUserId {
  userId: string;
}

export interface GetAllTasksProps extends WithUserId {}

export interface CreateTaskProps extends WithUserId {
  tasks: {
    content: string;
  }[];
}

export interface DeleteTaskProps extends WithUserId {
  taskId: string;
}
