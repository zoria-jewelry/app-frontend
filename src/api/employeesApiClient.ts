import { AbstractApiClient } from './abstractApiClient.ts';
import type { EmployeeDto, EmployeesListDto } from '../dto/employees.ts';
import type { CreateEmployeeFormData } from '../validation/schemas.ts';

export class EmployeesApiClient extends AbstractApiClient {
    public static async get(page: number): Promise<EmployeesListDto | undefined> {
        console.log(`EmployeesApiClient.get: page - ${page + 1}`);
        const params = { page: page + 1, isArchived: false, page_size: 10 };
        return await this.apiRequest<EmployeesListDto>({ url: `/employees/`, params });
    }

    public static async getAllActive(): Promise<EmployeeDto[] | undefined> {
        console.log(`EmployeesApiClient.getAllActive`);
        const params = { page: 1, isArchived: false, page_size: 100 };
        const response = await this.apiRequest<EmployeesListDto>({ url: `/employees/`, params });
        return response?.entries;
    }

    public static async getArchived(page: number): Promise<EmployeesListDto | undefined> {
        console.log(`EmployeesApiClient.getArchived: page - ${page}`);
        const params = { page: page + 1, isArchived: true, page_size: 10 };
        return await this.apiRequest<EmployeesListDto>({ url: `/employees/`, params });
    }

    public static async create(data: CreateEmployeeFormData): Promise<void> {
        console.log(`EmployeesApiClient.create: ${JSON.stringify(data)}`);
        return await this.apiRequest<void>({ url: `/employees/`, method: 'POST', data });
    }

    public static async moveToArchive(id: number): Promise<void> {
        console.log(`EmployeesApiClient.moveToArchive: ${id}`);
        return await this.apiRequest<void>({
            url: `/employees/${id}/`,
            method: 'PATCH',
            data: { isArchived: true },
        });
    }

    public static async removeFromArchive(id: number): Promise<void> {
        console.log(`EmployeesApiClient.removeFromArchive: ${id}`);
        return await this.apiRequest<void>({
            url: `/employees/${id}/`,
            method: 'PATCH',
            data: { isArchived: false },
        });
    }
}
