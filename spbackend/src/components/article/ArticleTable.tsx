import {
  type CreateArticlePayload,
  useDeleteArticle,
  useCreateArticle,
  useUpdateArticle,
  useArticlesPage,
} from "@/hooks/article/use-article"
import type { Article } from "@/types"
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
import { Link } from "react-router-dom"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"



/** 文章来源枚举 */
const srcLabels: Record<number, string> = {
  0: "手动录入",
  1: "go01",
  2: "第三方API",
  3: "用户投稿",
}

/** 文章状态枚举 */
const statusLabels: Record<number, string> = {
  0: "未完成",
  1: "正在处理",
  2: "已完成",
}

/** 文章状态 SelectTrigger 样式 */
const statusTriggerClass: Record<number, string> = {
  0: "bg-transparent text-muted-foreground hover:bg-accent",
  1: "bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100",
  2: "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100",
}

/** 可排序的字段类型 */
type SortField = "id" | "cid"
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


export const ArticleTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("id") // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑文章弹窗开关
  const [editingArticle, setEditingArticle] = useState<Article | null>(null) // 当前编辑的文章对象

  // ======== 创建文章表单状态 ========
  const [newArticleId, setNewArticleId] = useState(0) // 新文章ID
  const [newArticleTitle, setNewArticleTitle] = useState("") // 新文章标题
  const [newArticleContent, setNewArticleContent] = useState("") // 新文章内容
  const [newArticleFetchUrl, setNewArticleFetchUrl] = useState("") // 新文章fetch_url
  const [newArticleStatus, setNewArticleStatus] = useState(0) // 新文章状态


  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useArticlesPage(page, pageSize) //查询文章列表
  const { deleteArticle, loading: deleting } = useDeleteArticle() //删除文章
  const { createArticle, loading: creating } = useCreateArticle() //添加文章
  const { updateArticle, loading: updating } = useUpdateArticle() //更新文章

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredArticle = (data?.data || []).filter(
    (article) => article.title.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // country.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedArticleList = [...filteredArticle].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 国家名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
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

  //添加文章
  const handleCreateArticle = async () => {
    if (!newArticleTitle.trim()) return

    const payload: CreateArticlePayload = {
      id: newArticleId,
      title: newArticleTitle,
      content: newArticleContent,
      fetch_url: newArticleFetchUrl,
      status: newArticleStatus,
    }
    await createArticle(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewArticleId(0)
      setNewArticleTitle("")
      setNewArticleContent("")
      setNewArticleFetchUrl("")
      setNewArticleStatus(0)
      toast.add({
        type: "success",
        description: "添加文章成功",
      })
    })
  }

  //更新文章
  const handleEditArticle = async () => {
    if (!editingArticle) return
    console.log(editingArticle)
    await updateArticle({id:editingArticle.id,updates:editingArticle},()=>{
      refetch()
      setEditDialogOpen(false)
      setEditingArticle(null)
    })
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (article: Article) => {
    setEditingArticle({ ...article })
    setEditDialogOpen(true)
  }


  //删除文章
  const handleDeleteArticle = async (id: number) => {
    await deleteArticle(id, () => {
      refetch()
    })
  }

  //修改状态
  const handleStatusChange = async (article: Article, value: string) => {
    const nextStatus = Number(value)
    if (nextStatus === article.status) return


    await updateArticle(
      { id: article.id, updates: {
        ...article,
        status: nextStatus } },
      () => {
        refetch()
        toast.add({
          type: "success",
          description: `状态已更新为：${statusLabels[nextStatus]}`,
        })
      }
    )
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
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建Article弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加文章
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加文章</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Title</label>
                <Input
                  placeholder="输入标题"
                  value={newArticleTitle}
                  onChange={(e) => setNewArticleTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Content</label>
                <Input
                  placeholder="输入内容"
                  value={newArticleContent}
                  onChange={(e) => setNewArticleContent(e.target.value)}
                  className="w-full"
                />
              </div>
              <label className="text-xs font-medium">FetchUrl</label>
              <Input
                placeholder="输入FetchUrl"
                value={newArticleFetchUrl}
                onChange={(e) => setNewArticleFetchUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Status</label>
              <Input
                placeholder="输入状态"
                value={newArticleStatus}
                onChange={(e) => setNewArticleStatus(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateArticle}
                disabled={creating || !newArticleTitle.trim()}
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
            <TableHead>标题</TableHead>
            <TableHead>运程</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>来源</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedArticleList.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
              >
                暂无文章
              </TableCell>
            </TableRow>
          ) : (
            sortedArticleList.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.id}</TableCell>
                <TableCell>{article.title}</TableCell>
                <TableCell>
                  <Link to={article.fetch_url} target="_blank" rel="noopener noreferrer">
                    远程
                  </Link>
                 </TableCell>
                <TableCell>
                  <Select
                    value={String(article.status)}
                    onValueChange={(v) => v && handleStatusChange(article, v)}
                  >
                    <SelectTrigger
                      size="sm"
                      className={`w-[110px] ${statusTriggerClass[article.status] ?? ""}`}
                    >
                      <SelectValue>
                        {statusLabels[article.status] ?? `未知(${article.status})`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{srcLabels[article.src] ?? `未知(${article.src})`}</TableCell>
                <TableCell>
                  {new Date(article.created).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell>
                  {new Date(article.updated).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(article)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteArticle(article.id)}
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

      {/* ========== 编辑分类弹窗 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文章</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingArticle 存在时渲染表单 */}
          {editingArticle && (
            <div className="space-y-4">
              {/*<div>*/}
              {/*  <label className="text-xs font-medium">Lid</label>*/}
              {/*  <Input*/}
              {/*    placeholder="输入文章ID"*/}
              {/*    value={editingArticle.id}*/}
              {/*    onChange={(e) =>*/}
              {/*      setEditingArticle({*/}
              {/*        ...editingArticle,*/}
              {/*        id: Number(e.target.value),*/}
              {/*      })*/}
              {/*    }*/}
              {/*    className="w-full"*/}
              {/*  />*/}
              {/*</div>*/}
              <div>
                <label className="text-xs font-medium">标题</label>
                <Input
                  placeholder="输入文章名称"
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      title: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Src</label>
                <Input
                  placeholder="Src"
                  value={editingArticle.src}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      src: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditArticle} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}