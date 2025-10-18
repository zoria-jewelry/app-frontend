import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../configs/config.ts';
import axios from 'axios';
import Cookies from 'js-cookie';
import type { TokenResponseDto } from './authApiClient.ts';

const acceptableStatuses: number[] = [200, 201];

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
            if (acceptableStatuses.includes(resp.status)) {
                return resp.data as T;
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
                        if (acceptableStatuses.includes(retryResp.status)) {
                            return retryResp.data as T;
                        }
                    } catch (retryErr: any) {
                        console.error('Request failed after token refresh:', retryErr);
                        return undefined;
                    }
                } else {
                    console.error('Token refresh failed, redirecting to login');
                    this.handleUnauthorizedFinal();
                    return undefined;
                }
            }
        }

        return undefined;
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

            if (acceptableStatuses.includes(resp.status) && resp.data?.access) {
                Cookies.set('access_token', resp.data.access);
                console.log('Token refreshed successfully');
                return true;
            }

            console.error('Invalid refresh response:', resp.status, resp.data);
            return false;
        } catch (error: any) {
            console.error('Token refresh failed:', error.response?.status, error.message);
            return false;
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
