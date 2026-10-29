// {
//   "id": 1,
//   "name": "魔幻/科幻",
//   "parent": 0
// },

export interface Category {
  id: number
  name: string
  parent: number
  parent_category?: Category
}

export interface CategoryPage {
  data: Category[]
  total: number
  page: number
  size: number
}