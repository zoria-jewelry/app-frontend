import { AbstractApiClient } from './abstractApiClient.ts';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';

export interface WorkUnitsReportParams {
    startDate: Date;
    endDate: Date;
    employeeId: number;
    metalId: number;
    orderId?: number;
}

export class WorkUnitsApiClient extends AbstractApiClient {
    public static async getReportForPeriod({
        startDate,
        endDate,
        employeeId,
        metalId,
        orderId,
    }: WorkUnitsReportParams): Promise<WorkUnitsReportDto | undefined> {
        console.log(
            `WorkUnitsApiClient.getReportForPeriod: startDate=${startDate}, endDate=${endDate}, employeeId=${employeeId}, metalId=${metalId}, orderId=${orderId}`,
        );
        const response = await fetch(`/work-units-report.json`);
        return (await response.json()) as unknown as WorkUnitsReportDto;
    }
}
