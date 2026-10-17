import {
  useTempMovies,
  type CreateTempMoviePayload,
  useDeleteTempMovie,
  useCreateTempMovie,
  useUpdateTempMovie,
} from "@/hooks/temp/use-temp-movie"
import type { TempMovie } from "@/types"
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
import { Link } from "react-router-dom"

/** 可排序的字段类型 */
type SortField = "id" | "src"
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

export const TempMovieTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("src") // 排序字段，默认按来源
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑电影弹窗开关
  const [editingMovie, setEditingMovie] = useState<TempMovie | null>(null) // 当前编辑的电影对象

  // ======== 创建电影表单状态 ========
  const [newTempMovieName, setNewTempMovieName] = useState("") // 新电影名字
  const [newTempMovieFetchUrl, setNewTempMovieFetchUrl] = useState("") // 新电影抓取URL
  const [newTempMovieSrc, setNewTempMovieSrc] = useState(0) // 新电影来源
  const [newTempMovieStatus, setNewTempMovieStatus] = useState(0) // 新电影状态，默认待处理

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTempMovies(page, pageSize,1) //查询电影列表
  const { deleteTempMovie, loading: deleting } = useDeleteTempMovie() //删除电影
  const { createTempMovie, loading: creating } = useCreateTempMovie() //添加电影
  const { updateTempMovie, loading: updating } = useUpdateTempMovie() //更新电影

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredTempMovie = (data?.data || []).filter(
    (movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedTempMovieList = [...filteredTempMovie].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 联赛名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "src":
        comparison = a.src - b.src // 来源按数字排序
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

  //添加TempMovie
  const handleCreateTempMovie = async () => {
    if (!newTempMovieName.trim()) return
    if (!newTempMovieFetchUrl.trim()) return
    if (!newTempMovieSrc.toString()) return

    const payload: CreateTempMoviePayload = {
      title: newTempMovieName,
      fetch_url: newTempMovieFetchUrl,
      src: newTempMovieSrc,
      status: newTempMovieStatus,
    }
    await createTempMovie(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTempMovieName("")
      setNewTempMovieFetchUrl("")
      setNewTempMovieSrc(0)
      setNewTempMovieStatus(0)
      toast.add({
        type: "success",
        description: "添加电影成功",
      })
    })
  }

  //更新TempMovie
  const handleEditTempMovie = async () => {
    if (!editingMovie) return
    await updateTempMovie({ id: editingMovie.id, updates: editingMovie }, () => {
      refetch()
      setEditDialogOpen(false)
      setEditingMovie(null)
    })
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (movie: TempMovie) => {
    setEditingMovie({ ...movie })
    setEditDialogOpen(true)
  }

  //删除TempMovie
  const handleDeleteTempMovie = async (id: number) => {
    await deleteTempMovie(id, () => {
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
        <h1 className="text-2xl font-bold">Src1的电影列表</h1>
        {/* 创建TempMovie弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加电影
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加电影</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入电影名称"
                  value={newTempMovieName}
                  onChange={(e) => setNewTempMovieName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入电影FetchUrl"
                  value={newTempMovieFetchUrl}
                  onChange={(e) => setNewTempMovieFetchUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Src</label>
                <Input
                  placeholder="输入电影Src"
                  value={newTempMovieSrc}
                  onChange={(e) => setNewTempMovieSrc(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入电影Status"
                  value={newTempMovieStatus}
                  onChange={(e) =>
                    setNewTempMovieStatus(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTempMovie}
                disabled={creating || !newTempMovieName.trim()}
              >
                {creating ? "创建中..." : "创建电影"}
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
            <TableHead>Name</TableHead>
            {/*<TableHead>FetchUrl</TableHead>*/}
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("src")}
            >
              Src{" "}
              <SortIcon
                field="src"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>Status</TableHead>
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
          ) : sortedTempMovieList.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                暂无电影
              </TableCell>
            </TableRow>
          ) : (
            sortedTempMovieList.map((movie) => (
              <TableRow key={movie.id}>
                <TableCell>{movie.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">

                      <Link to={`/temp-movies/${movie.id}`}>
                        {movie.title}
                      </Link>

                  </div>
                </TableCell>
                <TableCell>{movie.category.name}</TableCell>
                <TableCell>
                  {/*{movie.tags.map((tag) => tag.name).join(", ") || "-"}*/}
                </TableCell>
                {/*<TableCell>{movie.fetch_url}</TableCell>*/}
                <TableCell>{movie.src}</TableCell>
                <TableCell>{movie.status}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(movie)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteTempMovie(movie.id)}
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
            <TableCell colSpan={8} className="text-center">
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
            <DialogTitle>编辑电影</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingMovie 存在时渲染表单 */}
          {editingMovie && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入电影名称"
                  value={editingMovie.title}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
                      title: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">FetchUrl</label>
                <Input
                  placeholder="输入电影URL地址"
                  value={editingMovie.fetch_url}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
                      fetch_url: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Src</label>
                <Input
                  placeholder="输入电影Src"
                  value={editingMovie.src}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
                      src: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Status</label>
                <Input
                  placeholder="输入电影Status"
                  value={editingMovie.status}
                  onChange={(e) =>
                    setEditingMovie({
                      ...editingMovie,
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
            <Button onClick={handleEditTempMovie} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
