import { useTempMovieDetail } from "@/hooks/temp/use-temp-movie"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Badge } from "@/components/ui/badge.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"

interface TempMovieDetailContentProps {
  id: number
}

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  0: { label: "待处理", variant: "secondary" },
  1: { label: "抓取中", variant: "default" },
  2: { label: "已完成", variant: "default" },
}

export const TempMovieDetailContent = ({ id }: TempMovieDetailContentProps) => {
  const { data: movie, loading, error } = useTempMovieDetail(id)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-destructive">
          加载失败：{error.message}
        </CardContent>
      </Card>
    )
  }

  if (!movie) {
    return (
      <Card>
        <CardContent className="pt-6 text-muted-foreground">
          未找到电影详情
        </CardContent>
      </Card>
    )
  }

  const statusInfo = statusMap[movie.status] || { label: "未知", variant: "secondary" }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {movie.title}
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">ID：</span>
            {movie.id}
          </div>
          <div>
            <span className="text-muted-foreground">来源：</span>
            {movie.src}
          </div>
          <div>
            <span className="text-muted-foreground">年份：</span>
            {movie.years || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">分级：</span>
            {movie.level}
          </div>
          <div>
            <span className="text-muted-foreground">导演：</span>
            {movie.director || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">演员：</span>
            {movie.actors || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">分类：</span>
            {movie.category?.name || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">HD：</span>
            {movie.hd || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">观看次数：</span>
            {movie.view}
          </div>
          <div>
            <span className="text-muted-foreground">集数：</span>
            {movie.tv}
          </div>
          <div>
            <span className="text-muted-foreground">完成状态：</span>
            {movie.finished || "-"}
          </div>
          <div>
            <span className="text-muted-foreground">创建时间：</span>
            {movie.created}
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">更新时间：</span>
            {movie.updated}
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">抓取URL：</span>
            <a
              href={movie.fetch_url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-blue-500 hover:underline"
            >
              {movie.fetch_url}
            </a>
          </div>
        </div>

        {movie.tags && movie.tags.length > 0 && (
          <div>
            <span className="text-sm text-muted-foreground">标签：</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {movie.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}