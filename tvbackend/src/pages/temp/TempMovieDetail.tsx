import { TempMovieDetailContent } from "@/components/temp/TempMovieDetail"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"
import { ArrowLeftIcon } from "lucide-react"

export default function TempMovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const movieId = id ? Number(id) : undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="size-4" />
          返回上一页
        </Button>
        <h1 className="text-2xl font-bold">电影详情</h1>
      </div>
      {movieId !== undefined ? (
        <TempMovieDetailContent id={movieId} />
      ) : (
        <div className="p-4 text-destructive">无效的电影 ID</div>
      )}
    </div>
  )
}