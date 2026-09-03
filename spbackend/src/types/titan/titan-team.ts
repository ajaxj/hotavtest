// http://127.0.0.1:42106/v1/titan_teams
// {
//   "id": 869,
//   "tid": 34750,
//   "zh": "邦警察FC",
//   "gb": "邦警察FC",
//   "en": "",
//   "icon": "",
//   "pos": ""
// },

export interface TitanTeam{
  id: number
  tid: number
  zh: string
  gb: string
  en: string
  icon: string
  pos: string
}

export interface TitanTeamPage{
  data: TitanTeam[]
  total: number
  page: number
  size: number
}