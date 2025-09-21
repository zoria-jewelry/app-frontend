import { AbstractApiClient } from './abstractApiClient.ts';
import type { GlobalStatsReport } from '../dto/stats.ts';
import type { AuditDetailsDto } from '../dto/audit.ts';

export class StatisticsApiClient extends AbstractApiClient {
    public static async getStatsForDate(date: Date): Promise<GlobalStatsReport> {
        console.log(`StatisticsApiClient.getStatsForDate: date=${date}`);
        const response = await fetch('/global-stats.json');
        return (await response.json()) as unknown as GlobalStatsReport;
    }

    public static async getAuditForPeriod(fromDate: Date, toDate: Date): Promise<AuditDetailsDto> {
        console.log(
            `StatisticsApiClient.getAuditForPeriod: fromDate=${fromDate}, toDate=${toDate}`,
        );
        const response = await fetch('/audit-records.json');
        return (await response.json()) as unknown as AuditDetailsDto;
    }
}
