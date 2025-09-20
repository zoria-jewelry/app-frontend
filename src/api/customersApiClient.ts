import { AbstractApiClient } from './abstractApiClient.ts';
import type { CustomerBalanceDto, CustomerDto, CustomerListDto } from '../dto/customers.ts';
import type { AuditRecord, CustomerAuditDetailsDto } from '../dto/audit.ts';
import type { CreateCustomerFormData, UpdateCustomerInfoFromData } from '../validation/schemas.ts';

export class CustomersApiClient extends AbstractApiClient {
    public static async get(
        page: number,
        searchPhrase: string,
    ): Promise<CustomerListDto | undefined> {
        console.log(`CustomersApiClient.get: page - ${page}, searchPhrase - ${searchPhrase}`);
        const params = {
            search: searchPhrase,
            page: page + 1,
        };
        return this.apiRequest<CustomerListDto>({ url: '/clients/', params });
    }

    public static async create(data: CreateCustomerFormData): Promise<void> {
        console.log(`CustomersApiClient.create: data - ${JSON.stringify(data)}`);
        await this.apiRequest<void>({ url: '/clients/', data, method: 'POST' });
    }

    public static async updateData(
        customerId: number,
        data: UpdateCustomerInfoFromData,
    ): Promise<void> {
        console.log(`CustomersApiClient.update: data - ${JSON.stringify(data)}`);
        await this.apiRequest<void>({ url: `/clients/${customerId}/`, data, method: 'PUT' });
    }

    public static async getInfoById(id: number): Promise<CustomerDto | undefined> {
        console.log(`CustomersApiClient.getInfoById: ${id}`);
        return await this.apiRequest<CustomerDto>({ url: `/clients/${id}/` });
    }

    public static async getCustomerBalanceById(
        id: number,
    ): Promise<CustomerBalanceDto | undefined> {
        console.log(`CustomersApiClient.getCustomerBalanceById: ${id}`);
        return await this.apiRequest<CustomerBalanceDto>({ url: `/clients/${id}/balance/` });
    }

    public static async getCustomerAuditRecords(
        id: number,
    ): Promise<CustomerAuditDetailsDto | undefined> {
        console.log(`CustomersApiClient.getCustomerAuditRecords: ${id}`);
        return {
            entries: (await this.apiRequest<AuditRecord[]>({ url: `/clients/${id}/audit/` })) ?? [],
        };
    }
}
