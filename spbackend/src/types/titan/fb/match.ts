import type { TitanFbTeam, TitanFbLeague } from "@/types"

interface TitanFbMatch {
  id: number
  mid: number
  match_time: string
  league_id: number
  league: TitanFbLeague
  home_id: number
  home_team: TitanFbTeam
  away_id: number
  away_team: TitanFbTeam
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

interface TitanFbMatchPage {
  data: TitanFbMatch[]
  total: number
  page: number
  size: number
}

export type { TitanFbMatch, TitanFbMatchPage }