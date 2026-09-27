export interface LogInfo {
  id: number
  title: string
  description?: string
  /**
   * 0: info
   * 1: warning
   * 2: error
   */
  type: number
  created: string
}

export interface LogInfoPage {
  data: LogInfo[]
  total: number
  page: number
  size: number
}
