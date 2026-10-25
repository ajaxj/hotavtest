
interface NsBsTeam {
  id: number
  tid: number
  zh: string
  gb: string
  en: string
  zhl: string
  gbl: string
  enl: string
  icon: string
  rank: string
}

interface NsBsTeamPage {
  data: NsBsTeam[]
  total: number
  page: number
  size: number
}

export type { NsBsTeam, NsBsTeamPage }
