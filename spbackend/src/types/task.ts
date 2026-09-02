
export interface Task {
  id: number
  title: string
  description?: string
  completed: boolean // 完成状态 0: 未完成 1: 已完成
  /**
   * 0: 一次性任务
   * 1: 定时任务重复
   * 2: 其它任务
   */
  status: number
  created: string
  finished: string
}

export interface TaskPage {
  data: Task[]
  total: number
  page: number
  size: number
}
