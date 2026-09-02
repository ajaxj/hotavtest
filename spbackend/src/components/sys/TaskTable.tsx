import { useState } from "react"
import {
  useTasks,
  useDeleteTask,
  useUpdateTask,
  useCreateTask,
  type CreateTaskPayload,
} from "@/hooks/sys/use-task.ts"
import type { Task } from "@/types"
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
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"

type SortField = "title" | "status" | "completed" | "created"
type SortOrder = "asc" | "desc"

const statusLabels: Record<number, string> = {
  0: "一次性任务",
  1: "定时任务",
  2: "其它任务",
}

const statusVariants: Record<number, "default" | "secondary" | "outline"> = {
  0: "default",
  1: "secondary",
  2: "outline",
}

const SortIcon = ({ field, sortField, sortOrder }: { field: SortField; sortField: SortField; sortOrder: SortOrder }) => {
  if (sortField !== field) return null
  return sortOrder === "asc" ? (
    <ChevronUpIcon className="inline ml-1 size-3" />
  ) : (
    <ChevronDownIcon className="inline ml-1 size-3" />
  )
}

export const TaskTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("created")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState<0 | 1 | 2>(0)

  const { data, loading, error, refetch } = useTasks(page, pageSize)
  const { createTask, loading: creating } = useCreateTask()
  const { updateTask, loading: updating } = useUpdateTask()
  const { deleteTask, loading: deleting } = useDeleteTask()

  const filteredTasks = data?.data.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "status":
        comparison = a.status - b.status
        break
      case "completed":
        comparison = Number(a.completed) - Number(b.completed)
        break
      case "created":
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime()
        break
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    const payload: CreateTaskPayload = {
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: newTaskStatus,
    }

    await createTask(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskStatus(0)
    })
  }

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

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id, () => {
      refetch()
    })
  }

  const handleToggleComplete = async (task: Task) => {
    await updateTask(
      { id: task.id, updates: { completed: !task.completed } },
      () => {
        refetch()
      }
    )
  }

  const openEditDialog = (task: Task) => {
    setEditingTask({ ...task })
    setEditDialogOpen(true)
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索任务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
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
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="任务标题"
                />
              </div>
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="任务描述（可选）"
                />
              </div>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">完成</TableHead>
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task)}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={task.completed ? "default" : "outline"}>
                    {task.completed ? "已完成" : "未完成"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(task.created).toLocaleString("zh-CN")}
                </TableCell>
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
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage(0)}
                  disabled={page === 0 || loading}
                >
                  首页
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  上一页
                </Button>
                <span className="text-xs text-muted-foreground">
                  第 {page + 1} 页 / 共 {totalPages} 页 (共 {data?.total || 0} 条)
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  下一页
                </Button>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                />
              </div>
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
            <Button onClick={handleEditTask} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
