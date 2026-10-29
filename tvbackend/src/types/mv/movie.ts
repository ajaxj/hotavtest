import type { Category, Tag } from "@/types"

export interface Movie {
  id: number
  title: string
  category_id: number
  category: Category
  tags: Tag[]
}

export interface MoviePage {
  data: Movie[]
  total: number
  page: number
  size: number
}