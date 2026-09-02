// 导入 API 工具函数和类型定义
import { API_ENDPOINTS, apiFetch, handleApiResponse } from './api';
import type { Auth, LoginRequest, CustomerError } from '@/types';

// localStorage 中存储认证信息的 Key
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_AT_KEY = 'expires_at';

// 判断当前运行环境是否为浏览器（SSR/Node 环境下 localStorage 不可用）
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * 将后端返回的认证响应归一化为统一的 Auth 结构
 * 兼容多种后端字段命名（如 token/access_token、expiresAt/expires_at/expiresIn/exp）
 * 同时将过期时间统一为毫秒级时间戳
 * @param data - 后端原始认证响应数据
 * @returns 归一化后的 Auth 对象
 * @throws 当响应结构非法或缺少 token 时抛出异常
 */
function normalizeAuthResponse(data: Auth): Auth {
  // 基本结构校验
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid auth response');
  }

  // 兼容后端不同字段命名，提取 token
  const token = data.token ?? data.access_token;
  const refreshToken = data.refresh_token;
  // expiresAt / expires_at / expiresIn / exp 均可能为过期时间字段
  const expiresAt = data.expiresAt ?? data.expires_at ?? data.expiresIn ?? data.exp;

  // token 必须为非空字符串
  if (typeof token !== 'string' || !token) {
    throw new Error('Missing or invalid token in auth response');
  }

  // 将过期时间统一为毫秒级时间戳
  let expiresAtNumber: number;
  if (typeof expiresAt === 'number' && Number.isFinite(expiresAt)) {
    // 小于 10000000000000 视为秒级时间戳，乘以 1000 转为毫秒
    if (expiresAt < 10000000000000) {
      expiresAtNumber = expiresAt * 1000;
    } else {
      expiresAtNumber = expiresAt;
    }
  } else if (typeof expiresAt === 'string' && !isNaN(Number(expiresAt))) {
    const numExpiresAt = Number(expiresAt);
    if (numExpiresAt < 10000000000000) {
      expiresAtNumber = numExpiresAt * 1000;
    } else {
      expiresAtNumber = numExpiresAt;
    }
  } else if (typeof data.expiresIn === 'number' && Number.isFinite(data.expiresIn)) {
    // expiresIn 表示有效期秒数，换算为绝对过期时间
    expiresAtNumber = Date.now() + data.expiresIn * 1000;
  } else {
    // 兜底：默认有效期 24 小时
    expiresAtNumber = Date.now() + 24 * 60 * 60 * 1000;
  }

  return {
    token,
    refresh_token: refreshToken,
    expires_at: expiresAtNumber,
  };
}

// 认证服务对象，封装登录、鉴权状态判断、Token 存取等操作
export const authService = {
  /**
   * 用户登录
   * 调用登录接口并将认证信息持久化到 localStorage
   * @param credentials - 登录凭证（如用户名、密码）
   * @returns 归一化后的 Auth 对象
   * @throws 当登录接口返回非 2xx 状态码时，抛出包含后端错误信息的异常
   */
  async login(credentials: LoginRequest): Promise<Auth> {
    const response = await apiFetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      // 登录接口无需携带已有 token，且不触发自动重定向
      skipAuth: true,
      skipAuthRedirect: true,
      body: JSON.stringify(credentials),
    });

    // HTTP 非 2xx：尝试解析后端返回的错误信息并抛出
    if (!response.ok) {
      const errorData = await handleApiResponse<CustomerError>(response, 'login', { throwOnHttpError: false });
      throw new Error(errorData?.error || 'Login failed');
    }

    // 登录成功：归一化响应并持久化
    const rawData = await response.json();
    const auth = normalizeAuthResponse(rawData);
    this.setAuth(auth);
    return auth;
  },

  /**
   * 将认证信息写入 localStorage
   * @param auth - 包含 token、refresh_token、expires_at 的认证对象
   * @throws 当 auth 缺少必要字段时抛出异常
   */
  setAuth(auth: Auth): void {
    if (!auth?.token || auth?.expires_at == null) {
      throw new Error('Invalid auth object: missing required fields');
    }
    // 非浏览器环境直接返回（如 SSR 期间）
    if (!isBrowser) return;
    localStorage.setItem(TOKEN_KEY, auth.token);
    // refresh_token 为可选字段，存在时才存储
    if (auth.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, auth.refresh_token);
    }
    localStorage.setItem(EXPIRES_AT_KEY, String(auth.expires_at));
  },

  /**
   * 从 localStorage 读取认证信息
   * 若存储的过期时间非法，会自动清理残留数据
   * @returns Auth 对象，不存在或不合法时返回 null
   */
  getAuth(): Auth | null {
    if (!isBrowser) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);

    // token 或过期时间缺失，视为未登录
    if (!token || !expiresAt) {
      return null;
    }

    // 过期时间解析失败，清理脏数据
    const expiresAtParsed = parseInt(expiresAt, 10);
    if (isNaN(expiresAtParsed) || !Number.isFinite(expiresAtParsed)) {
      this.clearAuth();
      return null;
    }

    return {
      token,
      refresh_token: refreshToken || undefined,
      expires_at: expiresAtParsed,
    };
  },

  /**
   * 获取当前存储的 access token 字符串
   * @returns token 字符串，不存在时返回 null
   */
  getToken(): string | null {
    if (!isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 判断当前 token 是否已过期
   * @returns true 表示已过期（或无有效 token），false 表示仍在有效期内
   */
  isTokenExpired(): boolean {
    if (!isBrowser) return true;
    const auth = this.getAuth();
    if (!auth) return true;
    if (!Number.isFinite(auth.expires_at)) return true;
    // 当前时间 >= 过期时间 视为已过期
    return Date.now() >= auth.expires_at;
  },

  /**
   * 清除 localStorage 中所有认证相关数据
   */
  clearAuth(): void {
    if (!isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },

  /**
   * 用户登出（内部委托给 clearAuth）
   */
  logout(): void {
    this.clearAuth();
  },

  /**
   * 判断当前用户是否处于认证状态
   * @returns true 表示有有效且未过期的 token
   */
  isAuthenticated(): boolean {
    if (!isBrowser) return false;
    return !this.isTokenExpired();
  },
};