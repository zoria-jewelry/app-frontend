import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../configs/config.ts';
import axios from 'axios';
import Cookies from 'js-cookie';
import type { TokenResponseDto } from './authApiClient.ts';

export abstract class AbstractApiClient {
    private static refreshTokenPromise: Promise<boolean> | null = null;
    private static isRefreshing = false;
    private static hasTriggeredRedirect = false;

    protected static async apiRequest<T>(
        cfg: AxiosRequestConfig & { _retry?: boolean } = {},
    ): Promise<T | undefined> {
        cfg.baseURL = cfg.baseURL || config.apiBase;

        if (cfg.params) {
            cfg.paramsSerializer = {
                serialize: (params) => {
                    const parts: string[] = [];
                    Object.entries(params).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            parts.push(
                                `${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`,
                            );
                        } else if (value !== undefined && value !== null) {
                            parts.push(
                                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
                            );
                        }
                    });
                    return parts.join('&');
                },
            };
        }

        if (cfg.baseURL !== config.vchasnoApiBase) {
            const accessToken = Cookies.get('access_token');
            if (accessToken) {
                cfg.headers = {
                    ...cfg.headers,
                    Authorization: 'Bearer ' + accessToken,
                };
            }
        }

        try {
            const resp = await axios.request<T>(cfg);
            if (resp.status >= 200 && resp.status < 300) {
                return resp.data as T;
            } else {
                const error = new Error(`Request failed with status ${resp.status}`);
                (error as any).response = resp;
                (error as any).status = resp.status;
                throw error;
            }
        } catch (err: any) {
            const status = err.response?.status;

            if (status === 401 && !cfg._retry && cfg.baseURL !== config.vchasnoApiBase) {
                const refreshSuccess = await this.handleTokenRefresh();

                if (refreshSuccess) {
                    cfg._retry = true;
                    cfg.headers = {
                        ...cfg.headers,
                        Authorization: 'Bearer ' + Cookies.get('access_token'),
                    };

                    try {
                        const retryResp = await axios.request<T>(cfg);
                        if (retryResp.status >= 200 && retryResp.status < 300) {
                            return retryResp.data as T;
                        } else {
                            const error = new Error(
                                `Request failed with status ${retryResp.status}`,
                            );
                            (error as any).response = retryResp;
                            (error as any).status = retryResp.status;
                            throw error;
                        }
                    } catch (retryErr: any) {
                        console.error('Request failed after token refresh:', retryErr);
                        throw retryErr;
                    }
                } else {
                    console.error('Token refresh failed, redirecting to login');
                    this.handleUnauthorizedFinal();
                    const error = new Error('Unauthorized: Token refresh failed');
                    (error as any).status = 401;
                    throw error;
                }
            } else {
                throw err;
            }
        }
    }

    private static async handleTokenRefresh(): Promise<boolean> {
        if (this.isRefreshing && this.refreshTokenPromise) {
            return await this.refreshTokenPromise;
        }

        this.isRefreshing = true;
        this.refreshTokenPromise = this.refreshToken();

        try {
            const success = await this.refreshTokenPromise;
            return success;
        } catch (error) {
            return false;
        } finally {
            this.isRefreshing = false;
            this.refreshTokenPromise = null;
        }
    }

    private static async refreshToken(): Promise<boolean> {
        const refreshToken = Cookies.get('refresh_token');

        if (!refreshToken) {
            console.error('No refresh token available');
            return false;
        }

        try {
            const resp: AxiosResponse<TokenResponseDto> = await axios.post(
                `${config.apiBase}/account/token/refresh/`,
                { refresh: refreshToken },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            if (resp.status >= 200 && resp.status < 300 && resp.data?.access) {
                Cookies.set('access_token', resp.data.access);
                console.log('Token refreshed successfully');
                return true;
            }

            const error = new Error(`Token refresh failed with status ${resp.status}`);
            (error as any).response = resp;
            (error as any).status = resp.status;
            throw error;
        } catch (error: any) {
            console.error('Token refresh failed:', error.response?.status, error.message);
            throw error;
        }
    }

    private static handleUnauthorizedFinal(): void {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (this.hasTriggeredRedirect) return;
        this.hasTriggeredRedirect = true;
        if (typeof window !== 'undefined') {
            window.location.replace('/login');
        }
    }
}
