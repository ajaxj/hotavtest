// {
//   "id": 127,
//   "cid": 110,
//   "zh": "沙滩赛事",
//   "gb": "",
//   "en": "",
//   "image": "images/164454816728.png",
//   "tag": 0
// },

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
