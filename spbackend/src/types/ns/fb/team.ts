
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
