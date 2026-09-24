// {
//   "id": 230,
//   "mid": 3094142,
//   "start_time": "10:00",
//   "match_time": "2026-09-22T10:10:14.245653+08:00",
//   "league_id": 0,
//   "home_id": 74954,
//   "away_id": 80659,
//   "home_score": 0,
//   "away_score": 0,
//   "home_score_half": 0,
//   "away_score_half": 0,
//   "status": -11
// },

import type { NsFbLeague, NsFbTeam } from "@/types"

interface NsFbMatch {
  id: number
  mid: number
  start_time: string
  match_time: string
  league_id: number
  league: NsFbLeague
  home_id: number
  home_team: NsFbTeam
  away_id: number
  away_team: NsFbTeam
  country_id: number
  status: number
  home_score: number
  away_score: number
  home_score_half: number
  away_score_half: number
  // home_red: number
  // away_red: number
  // home_yellow: number
  // away_yellow: number
  // home_corner: number
  // away_corner: number
}

interface NsFbMatchPage {
  data: NsFbMatch[]
  total: number
  page: number
  size: number
}

export type { NsFbMatch, NsFbMatchPage }
