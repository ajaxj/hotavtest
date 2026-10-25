


interface NsFbLeague {
  id: number
  lid: number
  ord: number
  zh: string
  gb: string
  en: string
  zhl: string
  gbl: string
  enl: string
  image: string
  color: string
  content: string
  cup: number
  subcup: number
  curyear: string
  years: string
  country_id: number
}

interface NsFbLeaguePage {
  data: NsFbLeague[]
  total: number
  page: number
  size: number
}

export type { NsFbLeague, NsFbLeaguePage }
