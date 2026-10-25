// {
//   "id": 74,
//   "cid": 33,
//   "zh": "新西兰",
//   "gb": "紐西蘭",
//   "en": "New Zealand",
//   "icon": "/files/SclassInfo/1g2c8yywk1.png",
//   "tag": 1
// },


interface NsBsCountry {
  id: number
  cid: number
  zh: string
  gb: string
  en: string
  icon: string
  tag: number
}

interface NsBsCountryPage {
  data: NsBsCountry[]
  total: number
  page: number
  size: number
}

export type { NsBsCountry, NsBsCountryPage }
