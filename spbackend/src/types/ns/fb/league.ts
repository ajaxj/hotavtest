


// {
//   "id": 986,
//   "lid": 2401,
//   "ord": 10,
//   "zh": "世沙运",
//   "gb": "",
//   "en": "",
//   "zhl": "",
//   "gbl": "",
//   "enl": "",
//   "image": "",
//   "color": "",
//   "country_id": 110,
//   "content": "",
//   "cup": 2,
//   "subcup": 0,
//   "curyear": "2022-2023\n",
//   "years": ""
// },


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
