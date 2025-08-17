import { AbstractApiClient } from './abstractApiClient.ts';
import type { EmployeeDto, EmployeesListDto } from '../dto/employees.ts';

export class EmployeesApiClient extends AbstractApiClient {
    public static async get(page: number): Promise<EmployeesListDto | undefined> {
        console.log(`EmployeesApiClient.get: page - ${page}`);
        const response = await fetch('/employees.json');
        const json = (await response.json()) as unknown as { pages: EmployeesListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: EmployeesListDto[] }>({});
        // return res?.pages[page];
    }

    public static async getAllActive(): Promise<EmployeeDto[] | undefined> {
        console.log(`EmployeesApiClient.getAllActive`);
        const response = await fetch('/employees.json');
        const json = (await response.json()) as unknown as { pages: EmployeesListDto[] };
        return json.pages.flatMap((page) => page.entries);
        // return res?.pages[page];
    }

    public static async getArchived(page: number): Promise<EmployeesListDto | undefined> {
        console.log(`EmployeesApiClient.getArchived: page - ${page}`);
        const response = await fetch('/employees.json');
        const json = (await response.json()) as unknown as { pages: EmployeesListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: EmployeesListDto[] }>({});
        // return res?.pages[page];
    }
}
