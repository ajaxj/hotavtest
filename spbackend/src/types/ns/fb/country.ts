

interface NsFbCountry {
  id: number
  cid: number
  zh: string
  gb: string
  en: string
  image: string
  tag: number

}

interface NsFbCountryPage {
  data: NsFbCountry[]
  total: number
  page: number
  size: number
}

export type { NsFbCountry, NsFbCountryPage }
