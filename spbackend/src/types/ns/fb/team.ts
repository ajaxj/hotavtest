// {
//   "id": 594,
//   "tid": 47011,
//   "zh": "大猩猩FC",
//   "gb": "大猩猩FC",
//   "en": "Gorilla FC",
//   "image": ""
// },

interface NsFbTeam {
  id: number
  tid: number
  zh: string
  gb: string
  en: string
  icon: string

}

interface NsFbTeamPage {
  data: NsFbTeam[]
  total: number
  page: number
  size: number
}

export type { NsFbTeam, NsFbTeamPage }
