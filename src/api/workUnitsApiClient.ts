import { AbstractApiClient } from './abstractApiClient.ts';
import type { WorkUnitDto, WorkUnitsReportDto } from '../dto/work-units.ts';
import type { WorkUnitsFilterData } from '../components/modal/work-units/WorkUnitsFilterComponent.tsx';
import type {
    CreateWorkUnitFormData,
    ReturnWorkUnitFormData,
    SaveMaterialFormData,
    UpdateWorkUnitFormData,
} from '../validation/schemas.ts';
import { toUtcString } from '../utils.ts';

export class WorkUnitsApiClient extends AbstractApiClient {
    public static async getReportForPeriod({
        periodStart,
        periodEnd,
        employeeId,
        materialId,
        orderId,
    }: WorkUnitsFilterData): Promise<WorkUnitsReportDto | undefined> {
        console.log(
            `WorkUnitsApiClient.getReportForPeriod: periodStart=${periodStart}, periodEnd=${periodEnd}, employeeId=${employeeId}, materialId=${materialId}, orderId=${orderId}`,
        );
        const params = {
            employeeId,
            periodStart: toUtcString(periodStart),
            periodEnd: toUtcString(periodEnd, true),
            materialId,
            orderId,
        };
        console.log('params', params);
        return await this.apiRequest<WorkUnitsReportDto>({ url: '/work-units/report/', params });
    }

    public static async issueMetal(data: CreateWorkUnitFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.issueMetal: ${data}`);
        await this.apiRequest<void>({ url: '/work-units/', method: 'POST', data });
    }

    public static async returnMetal(data: ReturnWorkUnitFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.returnMetal: ${data}`);
        await this.apiRequest<void>({ url: '/work-units/return-metal/', method: 'POST', data });
    }

    public static async saveMetal(data: SaveMaterialFormData): Promise<void> {
        console.log(`WorkUnitsApiClient.saveMetal: ${data}`);
        await this.apiRequest<void>({ url: '/work-units/save-metal/', method: 'POST', data });
    }

    public static async updateWorkUnit(
        payload: UpdateWorkUnitFormData,
        workUnit?: Pick<WorkUnitDto, 'metalReturned'>,
    ): Promise<void> {
        const { workUnitId, metalWeight, ...rest } = payload;

        const data: {
            returned?: number;
            issued?: number;
            loss?: number;
            description?: string;
        } = {};

        if (workUnit?.metalReturned != null) {
            data.returned = metalWeight;
        } else {
            data.issued = metalWeight;
        }

        if (rest.loss !== undefined) {
            data.loss = rest.loss;
        }

        if (rest.description !== undefined) {
            data.description = rest.description;
        }

        console.log(
            `WorkUnitsApiClient.updateWorkUnit: ${JSON.stringify({ workUnitId, ...data })}`,
        );
        await this.apiRequest<void>({
            url: `/work-units/${workUnitId}/`,
            method: 'PATCH',
            data,
        });
    }

    public static async rolloverWorkUnits(employeeId: number): Promise<void> {
        console.log(`WorkUnitsApiClient.rolloverWorkUnits`);
        await this.apiRequest<void>({
            url: `/employees/${employeeId}/rollover-open-issues/`,
            method: 'POST',
        });
    }
}
