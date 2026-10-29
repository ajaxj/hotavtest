
export interface Tag {
  id: number
  name: string

}

export interface TagPage {
  data: Tag[]
  total: number
  page: number
  size: number
}