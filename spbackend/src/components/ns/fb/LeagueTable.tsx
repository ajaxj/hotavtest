import {
  useNsLeagues,
  type CreateNsLeaguePayload,
  useDeleteNsLeague,
  useCreateNsLeague,
  useUpdateNsLeague,
} from "@/hooks/ns/fb/use-league"
import type { NsFbLeague } from "@/types"
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
type SortField = "id" | "lid"
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


export const LeagueTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("lid") // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑联赛弹窗开关
  const [editingLeague, setEditingLeague] = useState<NsFbLeague | null>(null) // 当前编辑的联赛对象

  // ======== 创建联赛表单状态 ========
  const [newNsLeagueLid, setNewNsLeagueLid] = useState(0) // 新联赛ID
  const [newNsLeagueZh, setNewNsLeagueZh] = useState("") // 新联赛名字
  const [newNsLeagueGb, setNewNsLeagueGb] = useState("") // 新联赛Gb
  const [newNsLeagueEn, setNewNsLeagueEn] = useState("") // 新联赛En
  const [newNsLeagueColor, setNewNsLeagueColor] = useState("") // 新联赛颜色
  const [newNsLeagueCountryId, setNewNsLeagueCountryId] = useState(0) // 新联赛国家ID

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useNsLeagues(page, pageSize) //查询NS联赛列表
  const { deleteNsLeague, loading: deleting } = useDeleteNsLeague() //删除NS联赛
  const { createNsLeague, loading: creating } = useCreateNsLeague() //添加NS联赛
  const { updateNsLeague, loading: updating } = useUpdateNsLeague() //更新NS联赛

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredNsLeague = (data?.data || []).filter(
    (league) => league.zh.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedNsLeagueList = [...filteredNsLeague].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 联赛名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "lid":
        comparison = a.lid - b.lid // ID按数字排序
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

  //添加NsLeague
  const handleCreateNsLeague = async () => {
    if (!newNsLeagueZh.trim()) return
    if (!newNsLeagueGb.trim()) return
    if (!newNsLeagueColor.trim()) return
    if (!newNsLeagueEn.trim()) return

    const payload: CreateNsLeaguePayload = {
      lid: newNsLeagueLid,
      zh: newNsLeagueZh,
      gb: newNsLeagueGb,
      en: newNsLeagueEn,
      color: newNsLeagueColor,
      country_id: newNsLeagueCountryId,
    }
    await createNsLeague(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewNsLeagueLid(0)
      setNewNsLeagueZh("")
      setNewNsLeagueGb("")
      setNewNsLeagueEn("")
      setNewNsLeagueColor("")
      setNewNsLeagueCountryId(0)
      toast.add({
        type: "success",
        description: "添加联赛成功",
      })
    })
  }

  //更新NsLeague
  const handleEditNsLeague = async () => {
    if (!editingLeague) return
    await updateNsLeague({id:editingLeague.id,updates:editingLeague},()=>{
      refetch()
      setEditDialogOpen(false)
      setEditingLeague(null)
    })
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (league: NsFbLeague) => {
    setEditingLeague({ ...league })
    setEditDialogOpen(true)
  }


  //删除NsLeague
  const handleDeleteNsLeague = async (id: number) => {
    await deleteNsLeague(id, () => {
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
              添加联赛
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加联赛</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Lid</label>
                <Input
                  placeholder="输入联赛ID"
                  value={newNsLeagueLid}
                  onChange={(e) => setNewNsLeagueLid(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入联赛名称"
                  value={newNsLeagueZh}
                  onChange={(e) => setNewNsLeagueZh(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入联赛Gb"
                  value={newNsLeagueGb}
                  onChange={(e) => setNewNsLeagueGb(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入联赛En"
                  value={newNsLeagueEn}
                  onChange={(e) => setNewNsLeagueEn(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Color</label>
                <Input
                  placeholder="输入联赛颜色"
                  value={newNsLeagueColor}
                  onChange={(e) => setNewNsLeagueColor(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">CountryId</label>
                <Input
                  placeholder="输入联赛国家ID"
                  value={newNsLeagueCountryId}
                  onChange={(e) =>
                    setNewNsLeagueCountryId(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateNsLeague}
                disabled={creating || !newNsLeagueZh.trim()}
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
            <TableHead className="cursor-pointer hover:bg-muted/50"
                       onClick={() => handleSort("lid")}
            >
              Lid{" "}
              <SortIcon
                field="lid"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>Gb</TableHead>
            <TableHead>En</TableHead>
            <TableHead>Color</TableHead>
            {/*<TableHead>Ltype</TableHead>*/}
            {/*<TableHead>CountryId</TableHead>*/}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedNsLeagueList.length === 0 ? (
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
            sortedNsLeagueList.map((league) => (
              <TableRow key={league.id}>
                <TableCell>{league.id}</TableCell>
                <TableCell>{league.lid}</TableCell>
                <TableCell>{league.zh}</TableCell>
                <TableCell>{league.gb}</TableCell>
                <TableCell>{league.en}</TableCell>
                <TableCell>{league.color}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(league)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteNsLeague(league.id)}
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
            <TableCell colSpan={7} className="text-center">
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
          {/* 仅当 editingLeague 存在时渲染表单 */}
          {editingLeague && (
            <div className="space-y-4">


              <div>
                <label className="text-xs font-medium">Lid</label>
                <Input
                  placeholder="输入联赛ID"
                  value={editingLeague.lid}
                  onChange={(e) => setEditingLeague({ ...editingLeague, lid: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入联赛名称"
                  value={editingLeague.zh}
                  onChange={(e) => setEditingLeague({ ...editingLeague, zh: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入联赛Gb"
                  value={editingLeague.gb}
                  onChange={(e) => setEditingLeague({ ...editingLeague, gb: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入联赛En"
                  value={editingLeague.en}
                  onChange={(e) => setEditingLeague({ ...editingLeague, en: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Color</label>
                <Input
                  placeholder="输入联赛颜色"
                  value={editingLeague.color}
                  onChange={(e) => setEditingLeague({ ...editingLeague, color: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">CountryId</label>
                <Input
                  placeholder="输入联赛国家ID"
                  value={editingLeague.country_id}
                  onChange={(e) =>
                    setEditingLeague({ ...editingLeague, country_id: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditNsLeague} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}