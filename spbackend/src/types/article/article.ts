import type { Category } from "@/types"


export interface Article {
  id: number
  title: string
  content: string
  fetch_url: string
  status: number
  src:number
  created: string
  updated: string
  category_id: number
  category: Category
  // tags: Tag[]
}

export interface ArticlePage {
  data: Article[]
  total: number
  page: number
  size: number
}