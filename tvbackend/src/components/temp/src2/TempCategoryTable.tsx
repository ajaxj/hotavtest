



import {
  useTempCategorys,
  type CreateTempCategoryPayload,
  useDeleteTempCategory,
  useCreateTempCategory,
  useUpdateTempCategory,
} from "@/hooks/temp/use-temp-category"
import type { TempCategory } from "@/types"
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
  DialogContent, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { toast } from "@/components/ui/toast.tsx"



/** 可排序的字段类型 */
type SortField = "id" | "status"
/** 排序方向：asc-升序，desc-降序 */
type SortOrder = "asc" | "desc"


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


export const TempCategoryTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("status") // 排序字段，默认按状态
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑分类弹窗开关
  const [editingCategory, setEditingCategory] = useState<TempCategory | null>(null) // 当前编辑的分类对象

  // ======== 创建分类表单状态 ========
  const [newTempCategoryName, setNewTempCategoryName] = useState("") // 新分类名字
  const [newTempCategoryFetchUrl, setNewTempCategoryFetchUrl] = useState("") // 新分类抓取URL
  const [newTempCategorySrc, setNewTempCategorySrc] = useState(0) // 新分类来源
  const [newTempCategoryStatus, setNewTempCategoryStatus] = useState(0) // 新分类状态


  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTempCategorys(page, pageSize,2) //查询分类列表
  const { deleteTempCategory, loading: deleting } = useDeleteTempCategory() //删除分类
  const { createTempCategory, loading: creating } = useCreateTempCategory() //添加分类
  const { updateTempCategory, loading: updating } = useUpdateTempCategory() //更新分类

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredTempCategory = (data?.data || []).filter(
    (category) => category.name.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedTempCategoryList = [...filteredTempCategory].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 联赛名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "status":
        comparison = a.status - b.status // 状态按数字排序
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

  //添加TempCategory
  const handleCreateTempCategory = async () => {
    if (!newTempCategoryName.trim()) return
    if (!newTempCategoryFetchUrl.trim()) return
    if (!newTempCategorySrc.toString()) return

    const payload: CreateTempCategoryPayload = {
      name: newTempCategoryName,
      fetch_url: newTempCategoryFetchUrl,
      src: newTempCategorySrc,
      status: newTempCategoryStatus,
    }
    await createTempCategory(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTempCategoryName("")
      setNewTempCategoryFetchUrl("")
      setNewTempCategorySrc(0)
      setNewTempCategoryStatus(0)
      toast.add({
        type: "success",
        description: "添加分类成功",
      })
    })
  }

  //更新TempCategory
  const handleEditTempCategory = async () => {
    if (!editingCategory) return
    await updateTempCategory({id:editingCategory.id,updates:editingCategory},()=>{
      refetch()
      setEditDialogOpen(false)
      setEditingCategory(null)
    })
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (category: TempCategory) => {
    setEditingCategory({ ...category })
    setEditDialogOpen(true)
  }


  //删除TempCategory
  const handleDeleteTempCategory = async (id: number) => {
    await deleteTempCategory(id, () => {
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
        <h1 className="text-2xl font-bold">Src2的分类列表</h1>
        {/* 创建TempCategory弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入分类名称"
                  value={newTempCategoryName}
                  onChange={(e) => setNewTempCategoryName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入分类FetchUrl"
                  value={newTempCategoryFetchUrl}
                  onChange={(e) => setNewTempCategoryFetchUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Src</label>
                <Input
                  placeholder="输入分类Src"
                  value={newTempCategorySrc}
                  onChange={(e) => setNewTempCategorySrc(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入分类Status"
                  value={newTempCategoryStatus}
                  onChange={(e) => setNewTempCategoryStatus(Number(e.target.value))}
                  className="w-full"
                />
              </div>


            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTempCategory}
                disabled={creating || !newTempCategoryName.trim()}
              >
                {creating ? "创建中..." : "创建分类"}
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
            <TableHead>
              Name
            </TableHead>
            <TableHead>FetchUrl</TableHead>
            <TableHead>Src</TableHead>
            <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}
            >
              Status{" "}
              <SortIcon
                field="status"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedTempCategoryList.length === 0 ? (
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
            sortedTempCategoryList.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.fetch_url}</TableCell>
                <TableCell>{category.src}</TableCell>
                <TableCell>{category.status}</TableCell>

                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(category)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteTempCategory(category.id)}
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
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingCategory 存在时渲染表单 */}
          {editingCategory && (
            <div className="space-y-4">



              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入分类名称"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入分类URL地址"
                  value={editingCategory.fetch_url}
                  onChange={(e) => setEditingCategory({ ...editingCategory, fetch_url: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Src</label>
                <Input
                  placeholder="输入分类Src"
                  value={editingCategory.src}
                  onChange={(e) => setEditingCategory({ ...editingCategory, src: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入分类状态"
                  value={editingCategory.status}
                  onChange={(e) => setEditingCategory({ ...editingCategory, status: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

            </div>

          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditTempCategory} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}