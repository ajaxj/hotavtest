
export interface TempTag {
    id: number
    name: string
    fetch_url: string
    src: number

}

export interface TempTagPage {
    data: TempTag[]
    total: number
    page: number
    size: number
}
