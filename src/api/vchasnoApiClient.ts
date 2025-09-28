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

    public static async startShift(): Promise<any> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            type: 1,
            fiscal: {
                task: 0,
            },
        };
        await this.apiRequest<any>({
            url: '/dm/execute',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });
    }

    public static async endShift(): Promise<any> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            type: 1,
            fiscal: {
                task: 11,
            },
        };
        await this.apiRequest<any>({
            url: '/dm/execute',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });
    }

    public static async checkout(paidMoney: number, paymentType: number): Promise<string> {
        const data = {
            ver: 6,
            source: 'API',
            device: 'Zoria Checkout',
            need_pf_img: '1',
            need_pf_pdf: '1',
            need_pf_txt: '1',
            need_pf_doccmd: '1',
            type: '1',
            fiscal: {
                task: 1,
                cashier: 'API',
                receipt: {
                    sum: paidMoney,
                    round: 0.0,
                    comment_down: 'Дякуємо, що обираєте нас!',
                    rows: [
                        {
                            name: 'Надання ювелірних послуг',
                            cnt: 1,
                            price: paidMoney,
                            disc_type: 0,
                            cost: paidMoney,
                            taxgrp: 1,
                        },
                    ],
                    pays: [
                        {
                            type: paymentType, // 0 - cash, 1 - transfer
                            sum: paidMoney,
                        },
                    ],
                },
            },
        };
        const response = await this.apiRequest<any>({
            url: '/dm/execute-prn',
            baseURL: config.vchasnoApiBase,
            data,
            method: 'POST',
        });

        console.log(response);
        return response.info.qr;
    }
}
