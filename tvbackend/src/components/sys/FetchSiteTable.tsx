import { useState } from "react"
// FetchSite相关的自定义 Hooks 和类型
import {
  useFetchSites,
  useDeleteFetchSite,
  useUpdateFetchSite,
  useCreateFetchSite,
  type CreateFetchSitePayload,
} from "@/hooks/sys/use-fetch-site"
import type { FetchSite } from "@/types"
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
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react"

/** 可排序的字段类型 */
type SortField = "name" | "status" | "created"
/** 排序方向：asc-升序，desc-降序 */
type SortOrder = "asc" | "desc"

/** FetchSite状态码与中文标签的映射 */
const statusLabels: Record<number, string> = {
  0: "待处理",
  1: "抓取中",
  2: "已完成",
}

/** FetchSite状态码与 Badge 组件样式变体的映射 */
const statusVariants: Record<number, "default" | "secondary" | "outline"> = {
  0: "default", // 主色
  1: "secondary", // 次要色
  2: "outline", // 描边
}

/**
 * 表头排序图标组件
 * 当字段是当前排序字段时，显示升序/降序箭头
 */
const SortIcon = ({
  field,
  sortField,
  sortOrder,
}: {
  field: SortField
  sortField: SortField
  sortOrder: SortOrder
}) => {
  // 如果不是当前排序字段，不显示图标
  if (sortField !== field) return null
  // 根据排序方向显示上箭头或下箭头
  return sortOrder === "asc" ? (
    <ChevronUpIcon className="ml-1 inline size-3" />
  ) : (
    <ChevronDownIcon className="ml-1 inline size-3" />
  )
}

/** FetchSite管理表格组件 */
export const FetchSiteTable = () => {
  // ======== 分页状态 ========
  const [page, setPage] = useState(0) // 当前页码（从 0 开始）
  const [pageSize] = useState(10) // 每页数量（固定 10 条）

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("created") // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建FetchSite弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑FetchSite弹窗开关
  const [editingFetchSite, setEditingFetchSite] = useState<FetchSite | null>(null) // 当前编辑的FetchSite对象

  // ======== 创建FetchSite表单状态 ========
  const [newFetchSiteName, setNewFetchSiteName] = useState("") // 新FetchSite名称
  const [newFetchSiteFetchUrl, setNewFetchSiteFetchUrl] = useState("") // 新FetchSiteURL
  const [newFetchSiteStatus, setNewFetchSiteStatus] = useState<0 | 1 | 2>(0) // 新FetchSite状态

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useFetchSites(page, pageSize) // 查询FetchSite列表
  const { createFetchSite, loading: creating } = useCreateFetchSite() // 创建FetchSite
  const { updateFetchSite, loading: updating } = useUpdateFetchSite() // 更新FetchSite
  const { deleteFetchSite, loading: deleting } = useDeleteFetchSite() // 删除FetchSite

  // ======== 前端搜索过滤 ========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredFetchSites = (data?.data || []).filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) || // 匹配标题
      task.fetch_url?.toLowerCase().includes(searchTerm.toLowerCase()) // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedFetchSites = [...filteredFetchSites].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name) // 标题按字符串排序
        break
      case "status":
        comparison = a.status - b.status // 类型按数字排序
        break
      case "created":
        comparison =
          new Date(a.created).getTime() - new Date(b.created).getTime() // 按创建时间戳排序
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
   * 提交创建FetchSite
   * 成功后刷新列表、关闭弹窗、清空表单
   */
  const handleCreateFetchSite = async () => {
    // 名称为空则不提交
    if (!newFetchSiteName.trim()) return

    const payload: CreateFetchSitePayload = {
      name: newFetchSiteName,
      fetch_url: newFetchSiteFetchUrl || undefined, // 空URL传 undefined
      status: newFetchSiteStatus,
    }

    await createFetchSite(payload, () => {
      refetch() // 刷新FetchSite列表
      setCreateDialogOpen(false) // 关闭弹窗
      setNewFetchSiteName("") // 重置表单
      setNewFetchSiteFetchUrl("")
      setNewFetchSiteStatus(0)
    })
  }

  /**
   * 提交编辑FetchSite
   * 将 editingFetchSite 整体作为更新内容提交
   */
  const handleEditFetchSite = async () => {
    if (!editingFetchSite) return

    await updateFetchSite({ id: editingFetchSite.id, updates: editingFetchSite }, () => {
      refetch()
      setEditDialogOpen(false)
      setEditingFetchSite(null)
    })
  }

  /**
   * 删除FetchSite
   * @param id - 要删除的FetchSite ID
   */
  const handleDeleteFetchSite = async (id: number) => {
    await deleteFetchSite(id, () => {
      refetch()
    })
  }

  /**
   * 切换FetchSite完成状态
   * 点击复选框时，将 completed 取反
   */
  const handleToggleComplete = async (fetchSite: FetchSite) => {
    await updateFetchSite(
      { id: fetchSite.id, updates: fetchSite },
      () => {
        refetch()
      }
    )
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建FetchSite副本，避免直接修改原数据
   */
  const openEditDialog = (fetchSite: FetchSite) => {
    setEditingFetchSite({ ...fetchSite })
    setEditDialogOpen(true)
  }

  // 计算总页数（向上取整）
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  // 错误状态渲染
  if (error) {
    return <div className="p-4 text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      {/* ========== 顶部工具栏：搜索框 + 添加按钮 ========== */}
      <div className="flex items-center justify-between gap-4">
        {/* 搜索输入框 */}
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索FetchSite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建FetchSite弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加FetchSite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新FetchSite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 标题输入 */}
              <div>
                <label className="text-xs font-medium">名称</label>
                <Input
                  value={newFetchSiteName}
                  onChange={(e) => setNewFetchSiteName(e.target.value)}
                  placeholder="FetchSite名称"
                />
              </div>
              {/* 描述输入 */}
              <div>
                <label className="text-xs font-medium">URL</label>
                <Input
                  value={newFetchSiteFetchUrl}
                  onChange={(e) => setNewFetchSiteFetchUrl(e.target.value)}
                  placeholder="FetchSiteURL"
                />
              </div>
              {/* 类型下拉选择 */}
              <div>
                <label className="text-xs font-medium">状态</label>
                <select
                  value={newFetchSiteStatus}
                  onChange={(e) =>
                    setNewFetchSiteStatus(Number(e.target.value) as 0 | 1 | 2)
                  }
                  className="h-8 w-full rounded-none border border-input px-2.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-blue-700 dark:text-white"
                >
                  <option value={0}>待处理</option>
                  <option value={1}>抓取中</option>
                  <option value={2}>已完成</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateFetchSite}
                disabled={
                  creating ||
                  !newFetchSiteName.trim() ||
                  !newFetchSiteFetchUrl.trim()
                }
              >
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ========== FetchSite表格 ========== */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">状态</TableHead>
            {/* 可点击排序的列表头 */}
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("name")}
            >
              名称{" "}
              <SortIcon
                field="name"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("status")}
            >
              状态{" "}
              <SortIcon
                field="status"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>URL</TableHead>
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
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedFetchSites.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                暂无FetchSite
              </TableCell>
            </TableRow>
          ) : (
            // 渲染FetchSite列表
            sortedFetchSites.map((fetchSite) => (
              <TableRow key={fetchSite.id}>
                {/* 完成复选框 */}
                <TableCell>
                  <Checkbox
                    checked={fetchSite.status === 2}
                    onCheckedChange={() => handleToggleComplete(fetchSite)}
                  />
                </TableCell>
                {/* 标题 */}
                <TableCell className="font-medium">{fetchSite.name}</TableCell>
                {/* 状态 Badge */}
                <TableCell>
                  <Badge variant={statusVariants[fetchSite.status]}>
                    {statusLabels[fetchSite.status]}
                  </Badge>
                </TableCell>
                {/* 完成状态 Badge */}
                <TableCell>{fetchSite.fetch_url}</TableCell>
                {/* 创建时间，格式化为中文本地化格式 */}
                <TableCell className="text-muted-foreground">
                  {new Date(fetchSite.created).toLocaleString("zh-CN")}
                </TableCell>
                {/* 操作按钮：编辑 + 删除 */}
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(fetchSite)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteFetchSite(fetchSite.id)}
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
            <TableCell colSpan={5} className="text-center">
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
                  第 {page + 1} 页 / 共 {totalPages} 页 (共 {data?.total || 0}{" "}
                  条)
                </span>
                {/* 下一页按钮 */}
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

      {/* ========== 编辑FetchSite弹窗 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑FetchSite</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingFetchSite 存在时渲染表单 */}
          {editingFetchSite && (
            <div className="space-y-4">
              {/* 编辑标题 */}
              <div>
                <label className="text-xs font-medium">名称</label>
                <Input
                  value={editingFetchSite.name}
                  onChange={(e) =>
                    setEditingFetchSite({
                      ...editingFetchSite,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              {/* 编辑描述 */}
              <div>
                <label className="text-xs font-medium">Fetch URL</label>
                <Input
                  value={editingFetchSite.fetch_url || ""}
                  onChange={(e) =>
                    setEditingFetchSite({
                      ...editingFetchSite,
                      fetch_url: e.target.value,
                    })
                  }
                />
              </div>
              {/* 编辑类型 */}
              <div>
                <label className="text-xs font-medium">状态</label>
                <select
                  value={editingFetchSite.status}
                  onChange={(e) =>
                    setEditingFetchSite({
                      ...editingFetchSite,
                      status: Number(e.target.value) as 0 | 1 | 2,
                    })
                  }
                  className="h-8 w-full rounded-none border border-input px-2.5 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-blue-700 dark:text-white"
                >
                  <option value={0}>待处理</option>
                  <option value={1}>抓取中</option>
                  <option value={2}>已完成</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditFetchSite} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
