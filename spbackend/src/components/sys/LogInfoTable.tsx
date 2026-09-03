import { useState } from "react"
import {
  useLogInfosPage,
  useDeleteLogInfo,
  useUpdateLogInfo,
  useCreateLogInfo,
  type CreateLogInfoPayload,
} from "@/hooks/sys/use-log-info.ts"
import type { LogInfo } from "@/types"
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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"

type SortField = "title" | "type" | "created"
type SortOrder = "asc" | "desc"

const typeLabels: Record<number, string> = {
  0: "info",
  1: "warning",
  2: "error",
}

const typeVariants: Record<number, "default" | "secondary" | "outline"> = {
  0: "default",
  1: "secondary",
  2: "outline",
}

const SortIcon = ({
  field,
  sortField,
  sortOrder,
}: {
  field: SortField
  sortField: SortField
  sortOrder: SortOrder
}) => {
  if (sortField !== field) return null
  return sortOrder === "asc" ? (
    <ChevronUpIcon className="ml-1 inline size-3" />
  ) : (
    <ChevronDownIcon className="ml-1 inline size-3" />
  )
}

export const LogInfoTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("created")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLogInfo, setEditingLogInfo] = useState<LogInfo | null>(null)
  const [newLogInfoTitle, setNewLogInfoTitle] = useState("")
  const [newLogInfoDescription, setNewLogInfoDescription] = useState("")
  const [newLogInfoType, setNewLogInfoType] = useState<0 | 1 | 2>(0)

  const { data, loading, error, refetch } = useLogInfosPage(page, pageSize)
  const { createLogInfo, loading: creating } = useCreateLogInfo()
  const { updateLogInfo, loading: updating } = useUpdateLogInfo()
  const { deleteLogInfo, loading: deleting } = useDeleteLogInfo()

  const filteredLogInfos =
    data?.data.filter(
      (logInfo) =>
        logInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        logInfo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  const sortedLogInfos = [...filteredLogInfos].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title)
        break
      case "type":
        comparison = a.type - b.type
        break
      case "created":
        comparison =
          new Date(a.created).getTime() - new Date(b.created).getTime()
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

  const handleCreateLogInfo = async () => {
    if (!newLogInfoTitle.trim()) return

    const payload: CreateLogInfoPayload = {
      title: newLogInfoTitle,
      description: newLogInfoDescription || undefined,
      type: newLogInfoType,
    }

    await createLogInfo(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewLogInfoTitle("")
      setNewLogInfoDescription("")
      setNewLogInfoType(0)
    })
  }

  const handleEditLogInfo = async () => {
    if (!editingLogInfo) return

    await updateLogInfo({ id: editingLogInfo.id, updates: editingLogInfo }, () => {
      refetch()
      setEditDialogOpen(false)
      setEditingLogInfo(null)
    })
  }

  const handleDeleteLogInfo = async (id: number) => {
    await deleteLogInfo(id, () => {
      refetch()
    })
  }


  const openEditDialog = (logInfo: LogInfo) => {
    setEditingLogInfo({ ...logInfo })
    setEditDialogOpen(true)
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  if (error) {
    return <div className="p-4 text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
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
                  value={newLogInfoTitle}
                  onChange={(e) => setNewLogInfoTitle(e.target.value)}
                  placeholder="任务标题"
                />
              </div>
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={newLogInfoDescription}
                  onChange={(e) => setNewLogInfoDescription(e.target.value)}
                  placeholder="任务描述（可选）"
                />
              </div>
              <div>
                <label className="text-xs font-medium">类型</label>
                <select
                  value={newLogInfoType}
                  onChange={(e) =>
                    setNewLogInfoType(Number(e.target.value) as 0 | 1 | 2)
                  }
                  className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value={0}>一次性任务</option>
                  <option value={1}>定时任务</option>
                  <option value={2}>其它任务</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateLogInfo}
                disabled={creating || !newLogInfoTitle.trim()}
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
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("title")}
            >
              标题{" "}
              <SortIcon
                field="title"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("type")}
            >
              类型{" "}
              <SortIcon
                field="type"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("created")}
            >
              创建时间{" "}
              <SortIcon
                field="created"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead className="w-32">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedLogInfos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            sortedLogInfos.map((logInfo) => (
              <TableRow key={logInfo.id}>
                <TableCell className="font-medium">{logInfo.title}</TableCell>
                <TableCell>
                  <Badge variant={typeVariants[logInfo.type]}>
                    {typeLabels[logInfo.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(logInfo.created).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(logInfo)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteLogInfo(logInfo.id)}
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
            <TableCell colSpan={5} className="text-center">
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
                  第 {page + 1} 页 / 共 {totalPages} 页 (共 {data?.total || 0}{" "}
                  条)
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
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
          {editingLogInfo && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  value={editingLogInfo.title}
                  onChange={(e) =>
                    setEditingLogInfo({ ...editingLogInfo, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">描述</label>
                <Input
                  value={editingLogInfo.description || ""}
                  onChange={(e) =>
                    setEditingLogInfo({
                      ...editingLogInfo,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">类型</label>
                <select
                  value={editingLogInfo.type}
                  onChange={(e) =>
                    setEditingLogInfo({
                      ...editingLogInfo,
                      type: Number(e.target.value) as 0 | 1 | 2,
                    })
                  }
                  className="h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  <option value={0}>一次性任务</option>
                  <option value={1}>定时任务</option>
                  <option value={2}>其它任务</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditLogInfo} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
