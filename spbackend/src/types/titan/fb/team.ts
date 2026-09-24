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

interface TitanFbTeam {
  id: number
  tid: number
  zh: string
  gb: string
  en: string
  icon: string
  pos: string
}

interface TitanFbTeamPage{
  data: TitanFbTeam[]
  total: number
  page: number
  size: number
}


export type { TitanFbTeam, TitanFbTeamPage }