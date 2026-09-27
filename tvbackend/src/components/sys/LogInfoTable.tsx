import { useState } from "react"
// 任务相关的自定义 Hooks 和类型
import {
  useLogInfos,
  useDeleteLogInfo,

} from "@/hooks/sys/use-log-info.ts"

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

// Lucide 图标库
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge.tsx"

/** 可排序的字段类型 */
type SortField = "created" | "type"
/** 排序方向：asc-升序，desc-降序 */
type SortOrder = "asc" | "desc"

/** 任务状态码与中文标签的映射 */
const statusLabels: Record<number, string> = {
  0: "一次性任务",
  1: "定时任务",
  2: "其它任务",
}

/** 任务状态码与 Badge 组件样式变体的映射 */
const statusVariants: Record<number, "default" | "secondary" | "outline"> = {
  0: "default",    // 主色
  1: "secondary",  // 次要色
  2: "outline",    // 描边
}

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

/** 任务管理表格组件 */
export const LogInfoTable = () => {
  // ======== 分页状态 ========
  const [page, setPage] = useState(0)          // 当前页码（从 0 开始）
  const [pageSize] = useState(10)              // 每页数量（固定 10 条）


  const [sortField, setSortField] = useState<SortField>("created")  // 排序字段，默认按创建时间
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")     // 排序方向，默认降序（最新在前）




  // ======== 调用自定义 Hooks ========
  const { data, loading, error, refetch } = useLogInfos(page, pageSize)           // 查询任务列表
  // const { createLogInfo, loading: creating } = useCreateLogInfo()                     // 创建任务
  // const { updateLogInfo, loading: updating } = useUpdateLogInfo()                     // 更新任务
  const { deleteLogInfo, loading: deleting } = useDeleteLogInfo()                     // 删除任务



  // ======== 前端排序 ========
  // 使用展开运算符创建副本，避免修改原数组
  const sortedLogInfos = [...(data?.data || [])].sort((a, b) => {
    let comparison = 0
    switch (sortField) {

      case "created":
        comparison = new Date(a.created).getTime() - new Date(b.created).getTime()    // 按创建时间戳排序
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
   * 删除任务
   * @param id - 要删除的任务 ID
   */
  const handleDeleteLogInfo = async (id: number) => {
    await deleteLogInfo(id, () => {
      refetch()
    })
  }


  // 计算总页数（向上取整）
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  // 错误状态渲染
  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* ========== 任务表格 ========== */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">完成</TableHead>
            {/* 可点击排序的列表头 */}
            <TableHead

            >
              标题
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("type")}
            >
              类型 <SortIcon field="type" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>

            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("created")}
            >
              创建时间 <SortIcon field="created" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead className="w-32">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* 加载中状态 */}
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                加载中...
              </TableCell>
            </TableRow>
          ) : sortedLogInfos.length === 0 ? (
            // 空数据状态
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                暂无任务
              </TableCell>
            </TableRow>
          ) : (
            // 渲染任务列表
            data?.data.map((logInfo) => (
              <TableRow key={logInfo.id}>
                {/* 完成复选框 */}
                <TableCell>
                  {logInfo.id}
                </TableCell>
                {/* 标题 */}
                <TableCell className="font-medium">
                  {logInfo.title}
                  {logInfo.description && <div className="text-sm text-muted-foreground">{logInfo.description}</div>}
                </TableCell>
                {/* 类型 Badge */}
                <TableCell>
                  <Badge variant={statusVariants[logInfo.type]}>
                    {statusLabels[logInfo.type]}
                  </Badge>
                </TableCell>

                {/* 创建时间，格式化为中文本地化格式 */}
                <TableCell className="text-muted-foreground">
                  {new Date(logInfo.created).toLocaleString("zh-CN")}
                </TableCell>
                {/* 操作按钮：编辑 + 删除 */}
                <TableCell>
                  <div className="flex gap-1">

                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => handleDeleteLogInfo(logInfo.id)}
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
                  第 {page + 1} 页 / 共 {totalPages} 页 (共 {data?.total || 0} 条)
                </span>
                {/* 下一页按钮 */}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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