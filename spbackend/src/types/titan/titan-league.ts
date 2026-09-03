//http://127.0.0.1:42106/v1/titan_leagues
// {
//   "id": 128,
//   "lid": 2149,
//   "zh": "所罗岛联",
//   "gb": "所羅島聯",
//   "en": "",
//   "color": "#666600",
//   "ltype": 0,
//   "country_id": 172
// },


export interface TitanLeague{
  id: number
  lid: number
  zh: string
  gb: string
  en: string
  color: string
  ltype: number
  country_id: number
}

export interface TitanLeaguePage{
  data: TitanLeague[]
  total: number
  page: number
  size: number
}
