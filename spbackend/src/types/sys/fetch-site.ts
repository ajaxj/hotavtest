// {
//   "id": 99,
//   "name": "Sp_中国99",
//   "fetch_url": "https://www.baidu.com99",
//   "status": 0,
//   "created": "2026-09-17T14:37:56.197268+08:00",
//   "updated": "2026-09-17T14:37:56.197268+08:00"
// },


export interface FetchSite {
  id: number
  name: string
  fetch_url: string
  status: number// 完成状态 0: 未完成 1: 已完成
  created: string
  finished: string
}

export interface FetchSitePage {
  data: FetchSite[]
  total: number
  page: number
  size: number
}
