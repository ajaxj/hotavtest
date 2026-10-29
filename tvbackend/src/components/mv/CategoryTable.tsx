import {
  useCategories,
  useDeleteCategory,
  useCreateCategory,
  useUpdateCategory,
  type CreateCategoryPayload,
} from "@/hooks/mv/use-category"
import type { Category } from "@/types"
import {
  Table,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button.tsx"
import {
  ChevronRightIcon,
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

export const CategoryTable = () => {
  const [page] = useState(0)
  const [pageSize] = useState(100)

  const [searchTerm, setSearchTerm] = useState("")

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryParent, setNewCategoryParent] = useState(0)

  const { data, loading, error, refetch } = useCategories(page, pageSize, 1)
  const { deleteCategory, loading: deleting } = useDeleteCategory()
  const { createCategory, loading: creating } = useCreateCategory()
  const { updateCategory, loading: updating } = useUpdateCategory()

  const allCategories = data?.data || []

  const { rootCategories, childrenMap } = useMemo(() => {
    const childrenMap = new Map<number, Category[]>()
    const rootCategories: Category[] = []

    for (const cat of allCategories) {
      if (cat.parent === 0) {
        rootCategories.push(cat)
      } else {
        const list = childrenMap.get(cat.parent) || []
        list.push(cat)
        childrenMap.set(cat.parent, list)
      }
    }

    rootCategories.sort((a, b) => a.id - b.id)
    for (const [key, list] of childrenMap) {
      list.sort((a, b) => a.id - b.id)
      childrenMap.set(key, list)
    }

    return { rootCategories, childrenMap }
  }, [allCategories])

  const filteredRootCategories = useMemo(() => {
    if (!searchTerm.trim()) return rootCategories

    const term = searchTerm.toLowerCase()
    const matchRoot = rootCategories.filter((c) =>
      c.name.toLowerCase().includes(term)
    )
    const matchedChildIds = new Set<number>()
    for (const [parentId, children] of childrenMap) {
      if (children.some((c) => c.name.toLowerCase().includes(term))) {
        matchedChildIds.add(parentId)
      }
    }
    const result = [...matchRoot]
    for (const root of rootCategories) {
      if (matchedChildIds.has(root.id) && !result.includes(root)) {
        result.push(root)
      }
    }
    result.sort((a, b) => a.id - b.id)
    return result
  }, [rootCategories, childrenMap, searchTerm])

  const filteredChildrenMap = useMemo(() => {
    if (!searchTerm.trim()) return childrenMap

    const term = searchTerm.toLowerCase()
    const result = new Map<number, Category[]>()
    for (const [parentId, children] of childrenMap) {
      const matched = children.filter((c) =>
        c.name.toLowerCase().includes(term)
      )
      if (matched.length > 0) {
        result.set(parentId, matched)
      } else {
        const parent = rootCategories.find((r) => r.id === parentId)
        if (parent && parent.name.toLowerCase().includes(term)) {
          result.set(parentId, children)
        }
      }
    }
    return result
  }, [childrenMap, rootCategories, searchTerm])

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(rootCategories.map((r) => r.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    const payload: CreateCategoryPayload = {
      name: newCategoryName,
      parent: newCategoryParent,
    }
    await createCategory(payload, () => {
      refetch()
      setCreateDialogOpen(false)
      setNewCategoryName("")
      setNewCategoryParent(0)
      toast.add({
        type: "success",
        description: "添加分类成功",
      })
    })
  }

  const handleEditCategory = async () => {
    if (!editingCategory) return
    await updateCategory(
      { id: editingCategory.id, updates: editingCategory },
      () => {
        refetch()
        setEditDialogOpen(false)
        setEditingCategory(null)
      }
    )
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory({ ...category })
    setEditDialogOpen(true)
  }

  const handleDeleteCategory = async (id: number) => {
    await deleteCategory(id, () => {
      refetch()
    })
  }

  if (error) {
    return <div className="p-4 text-destructive">Error: {error.message}</div>
  }

  const renderRow = (category: Category, depth: number, isParent: boolean): React.ReactNode => {
    const hasChildren = isParent && filteredChildrenMap.has(category.id)
    const isExpanded = expandedIds.has(category.id)
    const children = hasChildren ? filteredChildrenMap.get(category.id)! : []

    return (
      <>
        <TableRow key={category.id} className="group">
          <TableCell style={{ paddingLeft: `${depth * 20 + 12}px` }}>
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(category.id)}
                  className="inline-flex size-5 items-center justify-center rounded hover:bg-muted"
                >
                  <ChevronRightIcon
                    className={`size-3 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>
              ) : (
                <span className="inline-block size-5" />
              )}
              <span className="font-medium">{category.id}</span>
            </div>
          </TableCell>
          <TableCell>
            <span className={depth === 0 ? "font-semibold" : ""}>
              {category.name}
            </span>
          </TableCell>
          <TableCell>
            {category.parent === 0 ? (
              <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                主分类
              </span>
            ) : (
              <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                子分类 → #{category.parent}
              </span>
            )}
          </TableCell>
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
                onClick={() => handleDeleteCategory(category.id)}
                disabled={deleting}
              >
                <TrashIcon className="size-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          children.map((child) => renderRow(child, depth + 1, false))}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="搜索分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button size="xs" variant="outline" onClick={expandAll}>
            全部展开
          </Button>
          <Button size="xs" variant="outline" onClick={collapseAll}>
            全部折叠
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Src1的分类列表</h1>
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Parent (0 = 主分类)
                </label>
                <Input
                  placeholder="输入父分类ID，0表示主分类"
                  value={newCategoryParent}
                  onChange={(e) =>
                    setNewCategoryParent(Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateCategory}
                disabled={creating || !newCategoryName.trim()}
              >
                {creating ? "创建中..." : "创建分类"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-[160px]">类型</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                加载中...
              </TableCell>
            </TableRow>
          ) : filteredRootCategories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                暂无分类
              </TableCell>
            </TableRow>
          ) : (
            filteredRootCategories.map((category) =>
              renderRow(category, 0, true)
            )
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              <span className="text-xs text-muted-foreground">
                共 {rootCategories.length} 个主分类，{allCategories.length}{" "}
                个分类
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  placeholder="输入分类名称"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">
                  Parent (0 = 主分类)
                </label>
                <Input
                  placeholder="输入父分类ID"
                  value={editingCategory.parent}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      parent: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditCategory} disabled={updating}>
              {updating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}