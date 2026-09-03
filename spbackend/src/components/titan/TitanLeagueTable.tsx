import {
  useTitanLeagues,
  type CreateTitanLeaguePayload,
  useDeleteTitanLeague,
  useCreateTitanLeague,
} from "@/hooks/titan/use-titan-league"
import type { Task, TitanLeague, TitanLeaguePage } from "@/types"
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
import { PlusIcon, SearchIcon, TrashIcon } from "lucide-react"
import {
  Dialog,
  DialogContent, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { toast } from "@/components/ui/toast.tsx"


export const TitanLeagueTable = () => {
  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  // ======== 搜索与排序状态 ========
  const [searchTerm, setSearchTerm] = useState("") // 搜索关键词

  // ======== 弹窗状态 ========
  const [createDialogOpen, setCreateDialogOpen] = useState(false) // 创建联赛弹窗开关
  const [editDialogOpen, setEditDialogOpen] = useState(false) // 编辑联赛弹窗开关
  const [editingLeague, setEditingLeague] = useState<TitanLeague | null>(null) // 当前编辑的联赛对象

  // ======== 创建联赛表单状态 ========
  const [newTitanLeagueLid,setNewTitanLeagueLid] = useState(0)// 新联赛ID
  const [newTitanLeagueZh, setNewTitanLeagueZh] = useState("")              // 新联赛名字
  const [newTitanLeagueGb, setNewTitanLeagueGb] = useState("")  // 新联赛Gb
  const [newTitanLeagueEn, setNewTitanLeagueEn] = useState("")  // 新联赛En
  const [newTitanLeagueColor, setNewTitanLeagueColor] = useState("")  // 新联赛颜色
  const [newTitanLeagueLtype, setNewTitanLeagueLtype] = useState(0)// 新联赛类型
  const [newTitanLeagueCountryId, setNewTitanLeagueCountryId] = useState(0)// 新联赛国家ID


  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useTitanLeagues(page, pageSize) //查询Titan联赛列表
  const { deleteTitanLeague, loading: deleting } = useDeleteTitanLeague() //删除Titan联赛
  const { createTitanLeague, loading: creating } = useCreateTitanLeague() //添加Titan联赛

  //添加TitanLeague
  const handleCreateTitanLeague = async () => {
    if(!newTitanLeagueZh.trim()) return
    if(!newTitanLeagueGb.trim()) return
    if(!newTitanLeagueColor.trim()) return
    if(!newTitanLeagueEn.trim()) return

    const payload : CreateTitanLeaguePayload = {
      lid: newTitanLeagueLid,
      zh: newTitanLeagueZh,
      gb: newTitanLeagueGb,
      en: newTitanLeagueEn,
      color: newTitanLeagueColor,
      ltype: newTitanLeagueLtype,
      country_id: newTitanLeagueCountryId,
    }
    await createTitanLeague(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewTitanLeagueLid(0)
      setNewTitanLeagueZh("")
      setNewTitanLeagueGb("")
      setNewTitanLeagueEn("")
      setNewTitanLeagueColor("")
      setNewTitanLeagueLtype(0)
      setNewTitanLeagueCountryId(0)
      toast.add({
        type: "success",
        description: "添加联赛成功",
      })
    })


  }

  //删除TitanLeague
  const handleDeleteTitanLeague = async (id: number) => {
    await deleteTitanLeague(id, () => {
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
                  value={newTitanLeagueLid}
                  onChange={(e) => setNewTitanLeagueLid(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Zh</label>
                <Input
                  placeholder="输入联赛名称"
                  value={newTitanLeagueZh}
                  onChange={(e) => setNewTitanLeagueZh(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Gb</label>
                <Input
                  placeholder="输入联赛Gb"
                  value={newTitanLeagueGb}
                  onChange={(e) => setNewTitanLeagueGb(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">En</label>
                <Input
                  placeholder="输入联赛En"
                  value={newTitanLeagueEn}
                  onChange={(e) => setNewTitanLeagueEn(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Color</label>
                <Input
                  placeholder="输入联赛颜色"
                  value={newTitanLeagueColor}
                  onChange={(e) => setNewTitanLeagueColor(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Ltype</label>
                <Input
                  placeholder="输入联赛类型"
                  value={newTitanLeagueLtype}
                  onChange={(e) =>
                    setNewTitanLeagueLtype(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium">CountryId</label>
                <Input
                  placeholder="输入联赛国家ID"
                  value={newTitanLeagueCountryId}
                  onChange={(e) =>
                    setNewTitanLeagueCountryId(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              {/* 提交按钮：创建中或标题为空时禁用 */}
              <Button
                onClick={handleCreateTitanLeague}
                disabled={creating || !newTitanLeagueZh.trim()}
              >
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((league) => (
              <TableRow key={league.id}>
                <TableCell>{league.zh}</TableCell>
                <TableCell>{league.color}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteTitanLeague(league.id)}
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
            <TableCell colSpan={3} className="text-center">
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
    </div>
  )
}