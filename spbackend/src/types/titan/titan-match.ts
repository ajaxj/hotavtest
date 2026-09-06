import type { TitanTeam, TitanLeague } from "@/types"

export interface TitanMatch  {
  id: number
  mid: number
  match_time: string
  league_id: number
  league: TitanLeague
  home_id: number
  home_team: TitanTeam
  away_id: number
  away_team: TitanTeam
  country_id: number
  status: number
  home_score: number
  away_score: number
  home_score_half: number
  away_score_half: number
  home_red: number
  away_red: number
  home_yellow: number
  away_yellow: number
  home_corner: number
  away_corner: number
}

export interface TitanMatchPage {
  data: TitanMatch[]
  total: number
  page: number
  size: number
}
