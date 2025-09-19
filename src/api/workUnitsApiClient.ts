import { AbstractApiClient } from './abstractApiClient.ts';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';
import type { WorkUnitsFilterData } from '../components/modal/work-units/WorkUnitsFilterComponent.tsx';

export class WorkUnitsApiClient extends AbstractApiClient {
    public static async getReportForPeriod({
        startDate,
        endDate,
        employeeId,
        metalId,
        orderId,
    }: WorkUnitsFilterData): Promise<WorkUnitsReportDto | undefined> {
        console.log(
            `WorkUnitsApiClient.getReportForPeriod: startDate=${startDate}, endDate=${endDate}, employeeId=${employeeId}, metalId=${metalId}, orderId=${orderId}`,
        );
        const response = await fetch(`/work-units-report.json`);
        return (await response.json()) as unknown as WorkUnitsReportDto;
    }
}
