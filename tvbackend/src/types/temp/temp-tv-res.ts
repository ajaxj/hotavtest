
//
// {
//   "id": 4951,
//   "title": "第01集",
//   "fetch_url": "/dmkt/xierdadisanji/0-1.html",
//   "src": 1,
//   "status": 0,
//   "level": "云播二",
//   "finished": "2026-09-28T05:37:44.78388+08:00",
//   "created": "2026-09-28T05:37:44.78388+08:00",
//   "updated": "2026-09-28T05:37:44.78388+08:00",
//   "movie_id": 347,


import type { TempMovie } from "@/types"

export interface TempTvRes{
  id: number
  title: string
  fetch_url: string
  src: number
  status: number
  level: string
  finished: string
  created: string
  updated: string
  movie_id: number
  movie: TempMovie
}

export interface TempTvResPage {
  data: TempTvRes[]
  total: number
  page: number
  size: number
}
