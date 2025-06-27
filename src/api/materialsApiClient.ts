import { AbstractApiClient } from './abstractApiClient.ts';
import type { MaterialsListDto } from '../dto/materials.ts';

export class MaterialsApiClient extends AbstractApiClient {
    public static async get(page: number): Promise<MaterialsListDto | undefined> {
        console.log(`MaterialsApiClient.get: page - ${page}`);
        const response = await fetch('/materials.json');
        const json = (await response.json()) as unknown as { pages: MaterialsListDto[] };
        return json.pages[page];
        // TODO: use me - const res = await this.apiRequest<{ pages: MaterialsListDto[] }>({});
        // return res?.pages[page];
    }
}
