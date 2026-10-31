import {
  useFetchSitesPage,
  type CreateFetchSitePayload,
  useDeleteFetchSite,
  useCreateFetchSite,
  useUpdateFetchSite,
} from "@/hooks/sys/use-fetch-site"
import type { FetchSite } from "@/types"
// UI 组件：表格相关
import {
  Table,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table"
import { useState } from "react"
import { Button } from "@/components/ui/button.tsx"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { toast } from "@/components/ui/toast.tsx"

/** 站点状态枚举 */
const statusLabels: Record<number, string> = {
  0: "未完成",
  1: "已完成",
}

/** 可排序的字段类型 */
type SortField = "id" | "name"
/** 排序方向：asc-升序，desc-降序 */
type SortOrder = "asc" | "desc"

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

export const FetchSiteTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("id") // 排序字段，默认按ID排序
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建站点配置弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑站点配置弹窗开关
  const [editingSite, setEditingSite] = useState<FetchSite | null>(null) // 当前编辑的站点配置对象

  // ======== 创建站点配置表单状态 ========
  const [newSiteName, setNewSiteName] = useState("") // 新站点名称
  const [newSiteFetchUrl, setNewSiteFetchUrl] = useState("") // 新站点URL
  const [newSiteStatus, setNewSiteStatus] = useState(0) // 新站点状态

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useFetchSitesPage(page, pageSize) //查询站点配置列表
  const { deleteFetchSite, loading: deleting } = useDeleteFetchSite() //删除站点配置
  const { createFetchSite, loading: creating } = useCreateFetchSite() //添加站点配置
  const { updateFetchSite, loading: updating } = useUpdateFetchSite() //更新站点配置

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredSite = (data?.data || []).filter(
    (site) => site.name.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedSiteList = [...filteredSite].sort((a, b) => {
    let comparison: number
    switch (sortField) {
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "name":
        comparison = a.name.localeCompare(b.name) // 名称按字母排序
        break
      default:
        comparison = 0
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

  //添加站点配置
  const handleCreateSite = async () => {
    if (!newSiteName.trim()) return
    if (!newSiteFetchUrl.trim()) return


    const payload: CreateFetchSitePayload = {
      name: newSiteName,
      fetch_url: newSiteFetchUrl,
      status: newSiteStatus,
    }
    await createFetchSite(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewSiteFetchUrl("")
      setNewSiteStatus(0)
      setNewSiteName("")
      toast.add({
        type: "success",
        description: "添加站点配置成功",
      })
    })
  }

  //更新站点配置
  const handleEditSite = async () => {
    if (!editingSite) return
    await updateFetchSite(
      { id: editingSite.id, updates: editingSite },
      () => {
        refetch()
        setEditDialogOpen(false)
        setEditingSite(null)
      }
    )
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (site: FetchSite) => {
    setEditingSite({ ...site })
    setEditDialogOpen(true)
  }

  //删除站点配置
  const handleDeleteSite = async (id: number) => {
    await deleteFetchSite(id, () => {
      refetch()
    })
  }

  // 计算总页数（向上取整）
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  // 错误状态渲染
  if (error) {
    return <div className="p-4 text-destructive">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {/* 搜索输入框 */}
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索联赛..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建TitanLeague弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加站点配置
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加站点配置</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入站点配置名称"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入站点配置FetchUrl"
                  value={newSiteFetchUrl}
                  onChange={(e) => setNewSiteFetchUrl(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入站点配置状态"
                  value={newSiteStatus}
                  onChange={(e) =>
                    setNewSiteStatus(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>

            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateSite}
                disabled={creating || !newSiteName.trim() || !newSiteFetchUrl.trim() }
              >
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ========== 表格 ========== */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("id")}
            >
              ID{" "}
              <SortIcon
                field="id"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("name")}
            >
              Name{" "}
              <SortIcon
                field="name"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>FetchUrl</TableHead>
            <TableHead>Status</TableHead>

            <TableHead>Actions</TableHead>
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
          ) : sortedSiteList.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            sortedSiteList.map((site) => (
              <TableRow key={site.id}>
                <TableCell>{site.id}</TableCell>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.fetch_url}</TableCell>
                <TableCell>{statusLabels[site.status] ?? `未知(${site.status})`}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(site)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteSite(site.id)}
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

      {/* ========== 编辑联赛弹窗 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑联赛</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingSite 存在时渲染表单 */}
          {editingSite && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Id</label>
                <Input
                  placeholder="输入站点ID"
                  value={editingSite.id}
                  onChange={(e) =>
                    setEditingSite({
                      ...editingSite,
                      id: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入站点名称"
                  value={editingSite.name}
                  onChange={(e) =>
                    setEditingSite({ ...editingSite, name: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入站点FetchURL"
                  value={editingSite.fetch_url}
                  onChange={(e) =>
                    setEditingSite({ ...editingSite, fetch_url: e.target.value })
                  }
                  className="w-full"
                />
              </div>



              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入站点状态"
                  value={editingSite.status}
                  onChange={(e) =>
                    setEditingSite({
                      ...editingSite,
                      status: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditSite} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}