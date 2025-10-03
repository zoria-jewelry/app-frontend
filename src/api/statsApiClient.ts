import { AbstractApiClient } from './abstractApiClient.ts';
import type { GlobalStatsReport } from '../dto/stats.ts';
import type { AuditRecord } from '../dto/audit.ts';
import { toUtcString } from '../utils.ts';
import type { UpdateGlobalBalancesFormData } from '../validation/schemas.ts';

export class StatisticsApiClient extends AbstractApiClient {
    public static async getStatsForDate(date: Date): Promise<GlobalStatsReport | undefined> {
        console.log(`StatisticsApiClient.getStatsForDate: date=${date}`);
        const now = new Date();
        const params = {
            date:
                now.toDateString() === date.toDateString()
                    ? now.toISOString()
                    : toUtcString(date, true),
        };
        return this.apiRequest<GlobalStatsReport>({ url: '/stats/global-balance/', params });
    }

    public static async addTransactionInGlobalBalance(
        data: UpdateGlobalBalancesFormData,
    ): Promise<void> {
        console.log(
            `StatisticsApiClient.addTransactionInGlobalBalance: data - ${JSON.stringify(data)}`,
        );
        await this.apiRequest<void>({ url: '/stats/global-balance/', data, method: 'POST' });
    }

    public static async getAuditForPeriod(fromDate: Date, toDate: Date): Promise<AuditRecord[]> {
        console.log(
            `StatisticsApiClient.getAuditForPeriod: fromDate=${fromDate}, toDate=${toDate}`,
        );
        const params = {
            fromDate: toUtcString(fromDate),
            toDate: toUtcString(toDate),
        };
        return (
            (await this.apiRequest<AuditRecord[]>({ url: '/stats/global-audits/', params })) || []
        );
    }
}
