import { AbstractApiClient } from './abstractApiClient.ts';
import type { CustomerBalanceDto, CustomerDto, CustomerListDto } from '../dto/customers.ts';
import type { CustomerAuditDetailsDto } from '../dto/audit.ts';

export class CustomersApiClient extends AbstractApiClient {
    public static async get(
        page: number,
        searchPhrase: string,
    ): Promise<CustomerListDto | undefined> {
        console.log(`CustomersApiClient.get: page - ${page}, searchPhrase - ${searchPhrase}`);
        const response = await fetch('/customers.json');
        const json = (await response.json()) as unknown as { entries: CustomerDto[] };

        const filtered = json.entries.filter(
            (e) =>
                e.id === Number(searchPhrase) ||
                e.phone.includes(searchPhrase) ||
                e.fullName.toLowerCase().includes(searchPhrase.toLowerCase()),
        );

        return {
            entries: filtered.slice(page * 10, (page + 1) * 10),
            total: filtered.length,
            page,
        };
        // TODO: use me - const res = await this.apiRequest<{ pages: CustomerListDto[] }>({});
        // return res?.pages[page];
    }

    public static async getInfoById(id: number): Promise<CustomerDto | undefined> {
        console.log(`CustomersApiClient.getInfoById: ${id}`);
        const response = await fetch(`/customers.json`);
        const json = (await response.json()) as unknown as { entries: CustomerDto[] };

        return json.entries.find((e) => e.id === id);
    }

    public static async getCustomerBalanceById(
        id: number,
    ): Promise<CustomerBalanceDto | undefined> {
        console.log(`CustomersApiClient.getCustomerBalanceById: ${id}`);
        const response = await fetch(`/customer-balance.json`);
        return (await response.json()) as unknown as CustomerBalanceDto;
    }

    public static async getCustomerAuditRecords(
        id: number,
    ): Promise<CustomerAuditDetailsDto | undefined> {
        console.log(`CustomersApiClient.getCustomerAuditRecords: ${id}`);
        const response = await fetch(`/audit-records.json`);
        const parsed = (await response.json()) as unknown as CustomerAuditDetailsDto;
        parsed.entries = parsed.entries.filter((e) => !!e.affectedCustomerId);
        return parsed;
    }
}
