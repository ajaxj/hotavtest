import {
  useTitanMatches,
  type CreateTitanMatchPayload,
  useDeleteTitanMatch,
  useCreateTitanMatch,
  useUpdateTitanMatch,
} from "@/hooks/titan/use-titan-match"
import type { TitanMatch } from "@/types"
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


/** 可排序的字段类型 */
type SortField = "id" | "mid"
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

export const TitanMatchTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("mid") // 排序字段，默认按比赛ID排序
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑比赛弹窗开关
  const [editingMatch, setEditingMatch] = useState<TitanMatch | null>(null) // 当前编辑的比赛对象

  // ======== 创建比赛表单状态 ========
  const [newTitanMatchMid, setNewTitanMatchMid] = useState(0) // 新比赛ID
  const [newTitanMatchMatchTime, setNewTitanMatchMatchTime] = useState("") // 新比赛时间
  const [newTitanMatchLeagueId, setNewTitanMatchLeagueId] = useState(0) // 新联赛ID
  const [newTitanMatchHomeId, setNewTitanMatchHomeId] = useState(0) // 新主队ID
  const [newTitanMatchAwayId, setNewTitanMatchAwayId] = useState(0) // 新客队ID

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTitanMatches(page, pageSize) //查询Titan比赛列表
  const { deleteTitanMatch, loading: deleting } = useDeleteTitanMatch() //删除Titan比赛
  const { createTitanMatch, loading: creating } = useCreateTitanMatch() //添加Titan比赛
  const { updateTitanMatch, loading: updating } = useUpdateTitanMatch() //更新Titan比赛

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredTitanMatch = (data?.data || []).filter(
    (match) => match.match_time.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedTitanMatchList = [...filteredTitanMatch].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 联赛名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "mid":
        comparison = a.mid - b.mid // ID按数字排序
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

  //添加TitanMatch
  const handleCreateTitanMatch = async () => {
    if (!newTitanMatchMatchTime.trim()) return
    if (!newTitanMatchLeagueId) return
    if (!newTitanMatchHomeId) return
    if (!newTitanMatchAwayId) return

    const payload: CreateTitanMatchPayload = {
      mid: newTitanMatchMid,
      match_time: newTitanMatchMatchTime,
      league_id: newTitanMatchLeagueId,
      home_id: newTitanMatchHomeId,
      away_id: newTitanMatchAwayId,
      status: 0,
    }
    await createTitanMatch(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTitanMatchMid(0)
      setNewTitanMatchMatchTime("")
      setNewTitanMatchLeagueId(0)
      setNewTitanMatchHomeId(0)
      setNewTitanMatchAwayId(0)
      toast.add({
        type: "success",
        description: "添加比赛成功",
      })
    })
  }

  //更新TitanMatch
  const handleEditTitanMatch = async () => {
    if (!editingMatch) return
    await updateTitanMatch(
      { id: editingMatch.id, updates: editingMatch },
      () => {
        refetch()
        setEditDialogOpen(false)
        setEditingMatch(null)
      }
    )
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (match: TitanMatch) => {
    setEditingMatch({ ...match })
    setEditDialogOpen(true)
  }

  //删除TitanLeague
  const handleDeleteTitanMatch = async (mid: number) => {
    await deleteTitanMatch(mid, () => {
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
            placeholder="搜索比赛..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建TitanMatch弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加比赛
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加比赛</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Mid</label>
                <Input
                  placeholder="输入比赛ID"
                  value={newTitanMatchMid}
                  onChange={(e) => setNewTitanMatchMid(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">MatchTime</label>
                <Input
                  placeholder="输入比赛时间"
                  value={newTitanMatchMatchTime}
                  onChange={(e) => setNewTitanMatchMatchTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">LeagueId</label>
                <Input
                  placeholder="输入联赛ID"
                  value={newTitanMatchLeagueId}
                  onChange={(e) => setNewTitanMatchLeagueId(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">HomeId</label>
                <Input
                  placeholder="输入主队ID"
                  value={newTitanMatchHomeId}
                  onChange={(e) => setNewTitanMatchHomeId(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">AwayId</label>
                <Input
                  placeholder="输入客队ID"
                  value={newTitanMatchAwayId}
                  onChange={(e) => setNewTitanMatchAwayId(Number(e.target.value))}
                  className="w-full"
                />
              </div>

            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTitanMatch}
                disabled={creating }
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
              onClick={() => handleSort("mid")}
            >
              Mid{" "}
              <SortIcon
                field="mid"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>比赛时间</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>联赛</TableHead>
            <TableHead>主队</TableHead>
            <TableHead>比分</TableHead>
            <TableHead>半场比分</TableHead>
            <TableHead>客队</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedTitanMatchList.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            sortedTitanMatchList.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{match.id}</TableCell>
                <TableCell>{match.mid}</TableCell>
                <TableCell>{match.match_time}</TableCell>
                <TableCell>{match.status}</TableCell>
                <TableCell>{match.league.zh}</TableCell>
                {/*<TableCell>{match.league_id}</TableCell>*/}
                {/*<TableCell>{match.home_id}</TableCell>*/}
                <TableCell>{match.home_team.zh}</TableCell>
                <TableCell>{match.home_score}-{match.away_score}</TableCell>
                <TableCell>{match.home_score_half}-{match.away_score_half}</TableCell>
                {/*<TableCell>{match.away_id}</TableCell>*/}
                <TableCell>{match.away_team.zh}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(match)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteTitanMatch(match.id)}
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
            <TableCell colSpan={10} className="text-center">
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
          {/* 仅当 editingMatch 存在时渲染表单 */}
          {editingMatch && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Mid</label>
                <Input
                  placeholder="输入比赛ID"
                  value={editingMatch.mid}
                  onChange={(e) =>
                    setEditingMatch({
                      ...editingMatch,
                      mid: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Match Time</label>
                <Input
                  placeholder="输入比赛时间时间"
                  value={editingMatch.match_time}
                  onChange={(e) =>
                    setEditingMatch({ ...editingMatch, match_time: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">League ID</label>
                <Input
                  placeholder="输入联赛ID"
                  value={editingMatch.league_id}
                  onChange={(e) =>
                    setEditingMatch({ ...editingMatch, league_id: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Home ID</label>
                <Input
                  placeholder="输入主队ID"
                  value={editingMatch.home_id}
                  onChange={(e) =>
                    setEditingMatch({ ...editingMatch, home_id: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Away ID</label>
                <Input
                  placeholder="输入客队ID"
                  value={editingMatch.away_id}
                  onChange={(e) =>
                    setEditingMatch({
                      ...editingMatch,
                      away_id: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditTitanMatch} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
