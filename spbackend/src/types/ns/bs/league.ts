


interface NsBsLeague {
  id: number
  lid: number
  zh: string
  gb: string
  en: string
  zhl: string
  gbl: string
  enl: string
  icon: string
  color: string
  country_id: number
  description: string
  curyear: string
  years: string
  cup: number,
  cupstate: number,
}

interface NsBsLeaguePage {
  data: NsBsLeague[]
  total: number
  page: number
  size: number
}

export type { NsBsLeague, NsBsLeaguePage }
