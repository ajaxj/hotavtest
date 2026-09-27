import { API_ENDPOINTS } from "@/lib/api.ts"

export const fetchHomePage = async () => {
  const response = await fetch(API_ENDPOINTS.FETCH_HOME_PAGE)
  const data = await response.json()
  console.log(data)
}


export const fetchTvDetail = async () => {
  const response = await fetch(API_ENDPOINTS.FETCH_TV_DETAIL)
  const data = await response.json()
  console.log(data)
}