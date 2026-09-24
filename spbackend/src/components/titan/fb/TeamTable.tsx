import {
  useTitanTeams,
  type CreateTitanTeamPayload,
  useDeleteTitanTeam,
  useCreateTitanTeam,
  useUpdateTitanTeam,
} from "@/hooks/titan/fb/use-team"
import type { TitanTeam } from "@/types"
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
import { useState } from "react"
import { Button } from "@/components/ui/button.tsx"
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react"
import { Input } from "@/components/ui/input.tsx"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx"

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建球队弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑球队弹窗开关
  const [editingTeam, setEditingTeam] = useState<TitanTeam | null>(null) // 当前编辑的球队对象

  // ======== 创建球队表单状态 ========
  const [newTitanTeamTid, setNewTitanTeamTid] = useState(0) // 新球队ID
  const [newTitanTeamZh, setNewTitanTeamZh] = useState("") // 新球队名字
  const [newTitanTeamGb, setNewTitanTeamGb] = useState("") // 新球队Gb
  const [newTitanTeamEn, setNewTitanTeamEn] = useState("") // 新球队En
  const [newTitanTeamIcon, setNewTitanTeamIcon] = useState("") // 新球队图标
  const [newTitanTeamPos, setNewTitanTeamPos] = useState("") // 新球队位置

  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTitanTeams(page, pageSize) //查询TitanTeam列表
  const { deleteTitanTeam, loading: deleting } = useDeleteTitanTeam() //删除Titan球队
  const { createTitanTeam, loading: creating } = useCreateTitanTeam() //添加Titan球队
  const { updateTitanTeam, loading: updating } = useUpdateTitanTeam() //更新Titan球队

  const filteredTitanTeam = (data?.data || []).filter(
    (team) => team.zh.toLowerCase().includes(searchTerm.toLowerCase())
    // ||                // 匹配标题
    // league.en?.toLowerCase().includes(searchTerm.toLowerCase())            // 匹配描述
  )

  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedTitanTeamList = [...filteredTitanTeam].sort((a, b) => {
    let comparison = 0
    switch (sortField) {
      // case "zh":
      //   comparison = a.zh.localeCompare(b.zh)                                  // 联赛名称按字符串排序
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

  const handleCreateTitanTeam = async () => {
    if (!newTitanTeamZh.trim()) return
    if (!newTitanTeamGb.trim()) return
    if (!newTitanTeamEn.trim()) return

    const payload: CreateTitanTeamPayload = {
      tid: newTitanTeamTid,
      zh: newTitanTeamZh,
      gb: newTitanTeamGb,
      en: newTitanTeamEn,
      icon: newTitanTeamIcon,
      pos: newTitanTeamPos,
    }
    await createTitanTeam(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTitanTeamTid(0)
      setNewTitanTeamZh("")
      setNewTitanTeamGb("")
      setNewTitanTeamEn("")
      setNewTitanTeamIcon("")
      setNewTitanTeamPos("")
      toast.add({
        type: "success",
        description: "添加球队成功",
      })
    })
  }

  //更新TitanTeam
  const handleEditTitanTeam = async () => {
    if (!editingTeam) return
    await updateTitanTeam(
      { id: editingTeam.id, updates: editingTeam },
      () => {
        refetch()
        setEditDialogOpen(false)
        setEditingTeam(null)
      }
    )
  }

  /**
   * 打开编辑弹窗
   * 使用对象展开创建任务副本，避免直接修改原数据
   */
  const openEditDialog = (team: TitanTeam) => {
    setEditingTeam({ ...team })
    setEditDialogOpen(true)
  }

  const handleDeleteTitanTeam = async (id: number) => {
    await deleteTitanTeam(id, () => {
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
            placeholder="搜索球队..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8" // 左侧内边距留出图标位置
          />
        </div>

        {/* 创建TitanTeam弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger>
            <Button>
              <PlusIcon className="size-3.5" />
              添加球队
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加球队</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Tid</label>
                <Input
                  placeholder="输入球队ID"
                  value={newTitanTeamTid}
                  onChange={(e) => setNewTitanTeamTid(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入球队名称"
                  value={newTitanTeamZh}
                  onChange={(e) => setNewTitanTeamZh(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入球队Gb"
                  value={newTitanTeamGb}
                  onChange={(e) => setNewTitanTeamGb(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入球队En"
                  value={newTitanTeamEn}
                  onChange={(e) => setNewTitanTeamEn(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Icon</label>
                <Input
                  placeholder="输入球队Icon"
                  value={newTitanTeamIcon}
                  onChange={(e) => setNewTitanTeamIcon(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Pos</label>
                <Input
                  placeholder="输入球队Pos"
                  value={newTitanTeamPos}
                  onChange={(e) => setNewTitanTeamPos(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTitanTeam}
                disabled={creating || !newTitanTeamZh.trim()}
              >
                {creating ? "创建中..." : "创建球队"}
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
              onClick={() => handleSort("tid")}
            >
              Tid{" "}
              <SortIcon
                field="tid"
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </TableHead>
            <TableHead>Zh</TableHead>
            <TableHead>Gb</TableHead>
            <TableHead>En</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Pos</TableHead>

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
          ) : (
            sortedTitanTeamList.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.id}</TableCell>
                <TableCell>{team.tid}</TableCell>
                <TableCell>{team.zh}</TableCell>
                <TableCell>{team.gb}</TableCell>
                <TableCell>{team.en}</TableCell>
                <TableCell>{team.icon}</TableCell>
                <TableCell>{team.pos}</TableCell>
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
                      onClick={() => handleDeleteTitanTeam(team.id)}
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

      {/* ========== 编辑球队弹窗 ========== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑球队</DialogTitle>
          </DialogHeader>
          {/* 仅当 editingTeam 存在时渲染表单 */}
          {editingTeam && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Tid</label>
                <Input
                  placeholder="输入球队ID"
                  value={editingTeam.tid}
                  onChange={(e) =>
                    setEditingTeam({
                      ...editingTeam,
                      tid: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入球队名称"
                  value={editingTeam.zh}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, zh: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入球队Gb"
                  value={editingTeam.gb}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, gb: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入球队En"
                  value={editingTeam.en}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, en: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Icon</label>
                <Input
                  placeholder="输入球队icon"
                  value={editingTeam.icon}
                  onChange={(e) =>
                    setEditingTeam({ ...editingTeam, icon: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Pos</label>
                <Input
                  placeholder="输入球队位置"
                  value={editingTeam.pos}
                  onChange={(e) =>
                    setEditingTeam({
                      ...editingTeam,
                      pos:e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {/* 更新按钮 */}
            <Button onClick={handleEditTitanTeam} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
