

export interface TempCategory {
    id: number
    name: string
    parent: number
    fetch_url: string
    src: number
    /**
     * 0:待处理
     * 1: 抓取中
     * 2: 已完成
     */
    status: number
    total: number
    created: string
    updated: string
}

export interface TempCategoryPage {
    data: TempCategory[]
    total: number
    page: number
    size: number
}
