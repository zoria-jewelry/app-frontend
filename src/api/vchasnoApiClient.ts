import { AbstractApiClient } from './abstractApiClient.ts';
import { config } from '../configs/config.ts';

export class VchasnoApiClient extends AbstractApiClient {
    public static async isShiftActive(): Promise<boolean> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            type: 1,
            fiscal: {
                task: 18,
            },
        };
        const res: any = await this.apiRequest<any>({
            url: '/dm/execute',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });
        return Number(res.info.shift_status) === 1;
    }

    public static async startShift(): Promise<void> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            type: 1,
            fiscal: {
                task: 0,
            },
        };
        await this.apiRequest<void>({
            url: '/dm/execute',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });
    }

    public static async endShift(): Promise<void> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            type: 1,
            fiscal: {
                task: 1,
            },
        };
        await this.apiRequest<void>({
            url: '/dm/execute',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });
    }
}
