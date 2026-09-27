
export interface Auth {
    token: string
    access_token?: string
    refresh_token?: string
    expires_at: number
    expiresAt?: number
    expiresIn?: number
    exp?: number
}


export interface LoginRequest {
    username: string
    password: string
}

export interface CustomerError {
    error: string
}