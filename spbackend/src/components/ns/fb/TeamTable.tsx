import {
  useNsTeamsPage,
  type CreateNsTeamPayload,
  useDeleteNsTeam,
  useCreateNsTeam,
  useUpdateNsTeam,
} from "@/hooks/ns/fb/use-team"
import type { NsFbTeam } from "@/types"
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
type SortField = "id" | "tid"
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


export const TeamTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词
  const [sortField, setSortField] = useState<SortField>("tid") // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc") // 排序方向，默认降序（最新在前）

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑球队弹窗开关
  const [editingTeam, setEditingTeam] = useState<NsFbTeam | null>(null) // 当前编辑的球队对象

  // ======== 创建球队表单状态 ========
  const [newNsTeamTid, setNewNsTeamTid] = useState(0) // 新球队ID
  const [newNsTeamZh, setNewNsTeamZh] = useState("") // 新球队名字
  const [newNsTeamGb, setNewNsTeamGb] = useState("") // 新球队Gb
  const [newNsTeamEn, setNewNsTeamEn] = useState("") // 新球队En
  const [newNsTeamIcon, setNewNsTeamIcon] = useState("") // 新球队Icon
  const [newNsTeamTag, setNewNsTeamTag] = useState(0) // 新球队Tag

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useNsTeamsPage(page, pageSize) //查询NS球队列表
  const { deleteNsTeam, loading: deleting } = useDeleteNsTeam() //删除NS球队
  const { createNsTeam, loading: creating } = useCreateNsTeam() //添加NS球队
  const { updateNsTeam, loading: updating } = useUpdateNsTeam() //更新NS球队

  // ======== 前端搜索过滤 这里接口过来的data，需要套一个默认查询，然后再给table,好处是可以搜索，而且最后一页删除所有数据不会出错========
  // 注意：这里只在当前已加载的页面数据内搜索，不是服务端全量搜索
  const filteredNsTeam = (data?.data || []).filter(
    (team) => team.zh.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedNsTeamList = [...filteredNsTeam].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 球队名称按字符串排序
      //   break
      case "id":
        comparison = a.id - b.id // ID按数字排序
        break
      case "tid":
        comparison = a.tid - b.tid // 球队ID按数字排序
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

  //添加NsTeam
  const handleCreateNsTeam = async () => {
    if (!newNsTeamZh.trim()) return
    if (!newNsTeamGb.trim()) return
    if (!newNsTeamIcon.trim()) return
    if (!newNsTeamEn.trim()) return

    const payload: CreateNsTeamPayload = {
      tid: newNsTeamTid,
      zh: newNsTeamZh,
      gb: newNsTeamGb,
      en: newNsTeamEn,
      icon: newNsTeamIcon,
      tag: newNsTeamTag,
    }
    await createNsTeam(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewNsTeamTid(0)
      setNewNsTeamZh("")
      setNewNsTeamGb("")
      setNewNsTeamEn("")
      setNewNsTeamIcon("")
      setNewNsTeamTag(0)
      toast.add({
        type: "success",
        description: "添加球队成功",
      })
    })
  }

  //更新NsTeam
  const handleEditNsTeam = async () => {
    if (!editingTeam) return
    await updateNsTeam({id:editingTeam.id,updates:editingTeam},()=>{
      refetch()
      setEditDialogOpen(false)
      setEditingTeam(null)
    })
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (team: NsFbTeam) => {
    setEditingTeam({ ...team })
    setEditDialogOpen(true)
  }


  //删除NsTeam
  const handleDeleteNsTeam = async (id: number) => {
    await deleteNsTeam(id, () => {
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
                  placeholder="输入球队ID"
                  value={newNsTeamTid}
                  onChange={(e) => setNewNsTeamTid(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入球队名称"
                  value={newNsTeamZh}
                  onChange={(e) => setNewNsTeamZh(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入联赛Gb"
                  value={newNsTeamGb}
                  onChange={(e) => setNewNsTeamGb(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入联赛En"
                  value={newNsTeamEn}
                  onChange={(e) => setNewNsTeamEn(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Color</label>
                <Input
                  placeholder="输入球队图标"
                  value={newNsTeamIcon}
                  onChange={(e) => setNewNsTeamIcon(e.target.value)}
                  className="w-full"
                />
              </div>


            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateNsTeam}
                disabled={creating || !newNsTeamZh.trim()}
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
                       onClick={() => handleSort("tid")}
            >
              Tid{" "}
              <SortIcon
                field="tid"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>Gb</TableHead>
            <TableHead>En</TableHead>
            <TableHead>Icon</TableHead>
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
          ) : sortedNsTeamList.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                暂无球队
              </TableCell>
            </TableRow>
          ) : (
            sortedNsTeamList.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.id}</TableCell>
                <TableCell>{team.tid}</TableCell>
                <TableCell>{team.zh}</TableCell>
                <TableCell>{team.gb}</TableCell>
                <TableCell>{team.en}</TableCell>
                <TableCell>{team.icon}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => openEditDialog(team)}
                      disabled={updating}
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteNsTeam(team.id)}
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
          {/* 仅当 editingTeam 存在时渲染表单 */}
          {editingTeam && (
            <div className="space-y-4">


              <div>
                <label className="text-xs font-medium">Lid</label>
                <Input
                  placeholder="输入联赛ID"
                  value={editingTeam.tid}
                  onChange={(e) => setEditingTeam({ ...editingTeam, tid: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入联赛名称"
                  value={editingTeam.zh}
                  onChange={(e) => setEditingTeam({ ...editingTeam, zh: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入联赛Gb"
                  value={editingTeam.gb}
                  onChange={(e) => setEditingTeam({ ...editingTeam, gb: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入联赛En"
                  value={editingTeam.en}
                  onChange={(e) => setEditingTeam({ ...editingTeam, en: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Icon</label>
                <Input
                  placeholder="输入球队图标"
                  value={editingTeam.icon}
                  onChange={(e) => setEditingTeam({ ...editingTeam, icon: e.target.value })}
                  className="w-full"
                />
              </div>


            </div>

          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditNsTeam} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}