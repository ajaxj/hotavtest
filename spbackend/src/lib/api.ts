// API 基础地址
// export const API_BASE_URL = "https://data.zhibo20.com";
export const API_BASE_URL = "https://gin1.zhibo20.com";
// export const API_BASE_URL = "http://gin2.marstommy.serv00.net"

// API 接口端点常量
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  TASKS: `${API_BASE_URL}/v1/tasks`,
}

// API 请求配置选项接口，继承原生 RequestInit
interface ApiFetchOptions extends RequestInit {
    // 是否跳过自动添加认证 token
    skipAuth?: boolean;
    // 是否跳过认证失败后的重定向
    skipAuthRedirect?: boolean;
}

/**
 * 封装的 fetch 请求函数
 * 自动处理 Content-Type、Bearer Token 等通用请求头
 * @param url - 请求地址
 * @param options - 请求配置，支持 skipAuth 等自定义选项
 * @returns 原始 Response 对象
 */
export async function apiFetch(url: string, options: ApiFetchOptions = {}): Promise<Response> {
    // 构建请求头，默认 application/json，允许外部覆盖
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    // 若未跳过认证，则从 localStorage 读取 token 并添加到 Authorization 请求头
    if (!options.skipAuth) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // 发起 fetch 请求
    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}

/**
 * 统一处理 API 响应的工具函数
 * 解析 JSON 数据并处理 HTTP 错误
 * @param response - fetch 返回的 Response 对象
 * @param context - 调用上下文描述，用于错误提示
 * @param options - 配置选项，throwOnHttpError 为 true 时在 HTTP 错误时直接抛出异常
 * @returns 解析后的泛型数据 T，或 null（JSON 解析失败时）
 */
export async function handleApiResponse<T>(
    response: Response,
    context: string,
    options: { throwOnHttpError?: boolean } = {}
): Promise<T | null> {
    // HTTP 状态码非 2xx
    if (!response.ok) {
        // 若配置了 throwOnHttpError，则抛出带状态码和上下文的错误
        if (options.throwOnHttpError) {
            throw new Error(`HTTP error! status: ${response.status} for ${context}`);
        }
        // 尝试解析错误响应体为 JSON，失败则返回 null
        try {
            const errorData = await response.json();
            return errorData as T;
        } catch {
            return null;
        }
    }

    // HTTP 成功，尝试解析响应体为 JSON，失败则返回 null
    try {
        const data = await response.json();
        return data as T;
    } catch {
        return null;
    }
}