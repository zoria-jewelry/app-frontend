import { AbstractApiClient } from './abstractApiClient.ts';
import type { CustomerListDto } from '../dto/customers.ts';

export class CustomersApiClient extends AbstractApiClient {
    public static async get(page: number): Promise<CustomerListDto | undefined> {
        console.log(`CustomersApiClient.get: page - ${page}`);
        const response = await fetch('/customers.json');
        const json = (await response.json()) as unknown as { pages: CustomerListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: CustomerListDto[] }>({});
        // return res?.pages[page];
    }
}
