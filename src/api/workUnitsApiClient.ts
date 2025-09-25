import { AbstractApiClient } from './abstractApiClient.ts';
import type { WorkUnitsReportDto } from '../dto/work-units.ts';
import type { WorkUnitsFilterData } from '../components/modal/work-units/WorkUnitsFilterComponent.tsx';
import type {
    CreateWorkUnitFormData,
    ReturnWorkUnitFormData,
    SaveMetalFormData,
} from '../validation/schemas.ts';

export class WorkUnitsApiClient extends AbstractApiClient {
    public static async getReportForPeriod({
        startDate,
        endDate,
        employeeId,
        materialId,
        orderId,
    }: WorkUnitsFilterData): Promise<WorkUnitsReportDto | undefined> {
        console.log(
            `WorkUnitsApiClient.getReportForPeriod: startDate=${startDate}, endDate=${endDate}, employeeId=${employeeId}, materialId=${materialId}, orderId=${orderId}`,
        );
        const response = await fetch(`/work-units-report.json`);
        return (await response.json()) as unknown as WorkUnitsReportDto;
    }

    public static async issueMetal(data: CreateWorkUnitFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.issueMetal: ${data}`);
    }

    public static async returnMetal(data: ReturnWorkUnitFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.returnMetal: ${data}`);
    }

    public static async saveMetal(data: SaveMetalFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.saveMetal: ${data}`);
    }
}
