export interface FetchSite {
  id: number
  name: string
  fetch_url: string //最好对应golang api中的fetch_url字段这样格式，不能使用fetchUrl
  /**
   * 0:待处理
   * 1: 抓取中
   * 2: 已完成
   */
  status: number
  created: string
  updated: string
}

export interface FetchSitePage {
  data: FetchSite[]
  total: number
  page: number
  size: number
}
