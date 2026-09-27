

import type {TempTag, TempCategory} from "@/types";

export interface TempMovie {
    id: number
    title: string
    img: string
    fetch_url: string
    actors: string
    director: string
    years: string
    src: number
    /**
     * 0:待处理
     * 1: 抓取中
     * 2: 已完成
     */
    status: number
    level: number
    hd: string
    view: number
    tv: number
    finished: string
    created: string
    updated: string
    category_id: number
    category: TempCategory
    tags: TempTag[]
}

export interface TempMoviePage {
    data: TempMovie[]
    total: number
    page: number
    size: number
}


export interface TempMovieDetail {
    tags: TempTag[]
}