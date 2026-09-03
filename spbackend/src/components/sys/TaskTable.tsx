import { useState } from "react"
// 任务相关的自定义 Hooks 和类型
import {
  useTasks,
  useDeleteTask,
  useUpdateTask,
  useCreateTask,
  type CreateTaskPayload,
} from "@/hooks/sys/use-task.ts"
import type { Task } from "@/types"
// UI 组件：表格相关
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// UI 组件：对话框（弹窗）相关
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
// Lucide 图标库
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"

/** 可排序的字段类型 */
type SortField = "title" | "status" | "completed" | "created"
/** 排序方向：asc-升序，desc-降序 */
type SortOrder = "asc" | "desc"

/** 任务状态码与中文标签的映射 */
const statusLabels: Record<number, string> = {
  0: "一次性任务",
  1: "定时任务",
  2: "其它任务",
}

/** 任务状态码与 Badge 组件样式变体的映射 */
const statusVariants: Record<number, "default" | "secondary" | "outline"> = {
  0: "default",    // 主色
  1: "secondary",  // 次要色
  2: "outline",    // 描边
}

/**
 * 表头排序图标组件
 * 当字段是当前排序字段时，显示升序/降序箭头
 */
const SortIcon = ({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) => {
  // 如果不是当前排序字段，不显示图标
  if (sortField !== field) return null
  // 根据排序方向显示上箭头或下箭头
  return sortOrder === "asc" ? (
    <ChevronUpIcon className="inline ml-1 size-3" />
  ) : (
    <ChevronDownIcon className="inline ml-1 size-3" />
  )
}

/** 任务管理表格组件 */
export const TaskTable = () => {
  // ======== 分页状态 ========
  const [page, setPage] = useState(0)          // 当前页码（从 0 开始）
  const [pageSize] = useState(10)              // 每页数量（固定 10 条）

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("")              // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("created")  // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")     // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false)   // 创建任务弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false)       // 编辑任务弹窗开关
  const [editingTask, setEditingTask] = useState<Task | null>(null) // 当前编辑的任务对象

  // ======== 创建任务表单状态 ========
  const [newTaskTitle, setNewTaskTitle] = useState("")              // 新任务标题
  const [newTaskDescription, setNewTaskDescription] = useState("")  // 新任务描述
  const [newTaskStatus, setNewTaskStatus] = useState<0 | 1 | 2>(0)  // 新任务类型

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTasks(page, pageSize)           // 查询任务列表
  const { createTask, loading: creating } = useCreateTask()                     // 创建任务
  const { updateTask, loading: updating } = useUpdateTask()                     // 更新任务
  const { deleteTask, loading: deleting } = useDeleteTask()                     // 删除任务

  // ======== 前端搜索过滤 ========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredTasks = (data?.data || []).filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||                // 匹配标题
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title)                                  // 标题按字符串排序
        break
      case "status":
        comparison = a.status - b.status                                              // 类型按数字排序
        break
      case "completed":
        comparison = Number(a.completed) - Number(b.completed)                        // 完成状态转数字后排序
        break
      case "created":
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime()    // 按创建时间戳排序
        break
    }
    // 根据排序方向取正或负值
    return sortOrder === "asc" ? comparison : -comparison
  })

  /**
   * 处理表头点击排序
   * 逻辑：点击同一列切换排序方向，点击不同列重置为升序
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 同一列：切换升序/降序
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // 不同列：设为新字段，默认升序
      setSortField(field)
      setSortOrder("asc")
    }
  }

  /**
   * 提交创建任务
   * 成功后刷新列表、关闭弹窗、清空表单
   */
  const handleCreateTask = async () => {
    // 标题为空则不提交
    if (!newTaskTitle.trim()) return

    const payload: CreateTaskPayload = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,  // 空描述传 undefined
      status: newTaskStatus,
    }

    await createTask(payload, () => {
      refetch()                      // 刷新任务列表
      setCreateDialogOpen(false)     // 关闭弹窗
      setNewTaskTitle("")            // 重置表单
      setNewTaskDescription("")
      setNewTaskStatus(0)
    })
  }

  /**
   * 提交编辑任务
   * 将 editingTask 整体作为更新内容提交
   */
  const handleEditTask = async () => {
    if (!editingTask) return

    await updateTask(
      { id: editingTask.id, updates: editingTask },
      () => {
        refetch()
        setEditDialogOpen(false)
        setEditingTask(null)
      }
    )
  }

  /**
   * 删除任务
   * @param id - 要删除的任务 ID
   */
  const handleDeleteTask = async (id: number) => {
    await deleteTask(id, () => {
      refetch()
    })
  }

  /**
   * 切换任务完成状态
   * 点击复选框时，将 completed 取反
   */
  const handleToggleComplete = async (task: Task) => {
    await updateTask(
      { id: task.id, updates: { completed: !task.completed } },
      () => {
        refetch()
      }
    )
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task })
    setEditDialogOpen(true)
  }

  // 计算总页数（向上取整）
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  // 错误状态渲染
  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ========== 顶部工具栏：搜索框 + 添加按钮 ========== */}
      <div className="flex items-center justify-between gap-4">
        {/* 搜索输入框 */}
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"  // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建任务弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加任务
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新任务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 标题输入 */}
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="任务标题"
                />
              </div>
              {/* 描述输入 */}
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="任务描述（可选）"
                />
              </div>
              {/* 类型下拉选择 */}
              <div>
                <label className="text-xs font-medium">类型</label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(Number(e.target.value) as 0 | 1 | 2)}
                  className="w-full h-8 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value={0}>一次性任务</option>
                  <option value={1}>定时任务</option>
                  <option value={2}>其它任务</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTask}
                disabled={creating || !newTaskTitle.trim()}
              >
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ========== 任务表格 ========== */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">完成</TableHead>
            {/* 可点击排序的列表头 */}
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("title")}
            >
              标题 <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("status")}
            >
              类型 <SortIcon field="status" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("completed")}
            >
              状态 <SortIcon field="completed" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("created")}
            >
              创建时间 <SortIcon field="created" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead className="w-32">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedTasks.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            // 渲染任务列表
            sortedTasks.map((task) => (
              <TableRow key={task.id}>
                {/* 完成复选框 */}
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                  />
                </TableCell>
                {/* 标题 */}
                <TableCell className="font-medium">{task.title}</TableCell>
                {/* 类型 Badge */}
                <TableCell>
                  <Badge variant={statusVariants[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                </TableCell>
                {/* 完成状态 Badge */}
                <TableCell>
                  <Badge variant={task.completed ? "default" : "outline"}>
                    {task.completed ? "已完成" : "未完成"}
                  </Badge>
                </TableCell>
                {/* 创建时间，格式化为中文本地化格式 */}
                <TableCell className="text-muted-foreground">
                  {new Date(task.created).toLocaleString("zh-CN")}
                </TableCell>
                {/* 操作按钮：编辑 + 删除 */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(task)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={deleting}
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {/* 表格底部：分页控件 */}
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              <div className="flex items-center justify-center gap-2">
                {/* 首页按钮 */}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage(0)}
                  disabled={page === 0 || loading}
                >
                  首页
                </Button>
                {/* 上一页按钮 */}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  上一页
                </Button>
                {/* 页码信息显示 */}
                <span className="text-xs text-muted-foreground">
                  第 {page + 1} 页 / 共 {totalPages} 页 (共 {data?.total || 0} 条)
                </span>
                {/* 下一页按钮 */}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  下一页
                </Button>
                {/* 尾页按钮 */}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage(Math.max(0, totalPages - 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  尾页
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* ========== 编辑任务弹窗 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingTask 存在时渲染表单 */}
          {editingTask && (
            <div className="space-y-4">
              {/* 编辑标题 */}
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
              </div>
              {/* 编辑描述 */}
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                />
              </div>
              {/* 编辑类型 */}
              <div>
                <label className="text-xs font-medium">类型</label>
                <select
                  value={editingTask.status}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      status: Number(e.target.value) as 0 | 1 | 2,
                    })
                  }
                  className="w-full h-8 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value={0}>一次性任务</option>
                  <option value={1}>定时任务</option>
                  <option value={2}>其它任务</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditTask} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}