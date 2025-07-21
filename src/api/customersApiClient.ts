import { AbstractApiClient } from './abstractApiClient.ts';
import type { CustomerDto, CustomerListDto } from '../dto/customers.ts';

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
            perPage: 10,
            page,
        };
        // TODO: use me - const res = await this.apiRequest<{ pages: CustomerListDto[] }>({});
        // return res?.pages[page];
    }
}
