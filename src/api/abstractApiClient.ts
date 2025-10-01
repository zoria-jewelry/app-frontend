import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../configs/config.ts';
import axios from 'axios';

const acceptableStatuses: number[] = [200, 201];

export abstract class AbstractApiClient {
    private static refreshTokenPromise: Promise<void> | null = null;

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

        try {
            /**
             *
             * We are using cookies for access/refresh tokens so there is
             * no need in explicitly sending them in the request
             *
             * */
            const resp = await axios.request<T>(cfg);
            if (acceptableStatuses.includes(resp.status)) {
                return resp.data as T;
            }
        } catch (err: any) {
            const status = err.response?.status;

            /**
             *
             * If access token has expired - try to refresh it once.
             * Once again since we use cookies - no need in explicit token saving.
             *
             * */
            if (status === 401 && !cfg._retry) {
                if (!this.refreshTokenPromise) {
                    this.refreshTokenPromise = this.refreshToken()
                        .then((success) => {
                            this.refreshTokenPromise = null;
                            if (!success) throw new Error('refresh failed');
                            return undefined;
                        })
                        .catch(() => {
                            this.refreshTokenPromise = null;
                            throw new Error('refresh failed');
                        });
                }

                cfg._retry = true;

                try {
                    const retryResp = await axios.request<T>(cfg);
                    if (!acceptableStatuses.includes(retryResp.status)) {
                        return undefined;
                    }
                    return retryResp.data as T;
                } catch (err: any) {
                    return undefined;
                }
            }
        }
    }

    private static async refreshToken(): Promise<boolean> {
        try {
            const resp: AxiosResponse<undefined> = await axios.get(
                `${config.apiBase}/public/users/refresh-token`,
            );

            return acceptableStatuses.includes(resp.status);
        } catch {
            return false;
        }
    }
}
