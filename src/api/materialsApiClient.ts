import { AbstractApiClient } from './abstractApiClient.ts';
import type { MaterialDto, MaterialsListDto } from '../dto/materials.ts';
import type { CreateMaterialFormData, UpdateMaterialFormData } from '../validation/schemas.ts';

export class MaterialsApiClient extends AbstractApiClient {
    public static async get(page: number): Promise<MaterialsListDto | undefined> {
        console.log(`MaterialsApiClient.get: page - ${page + 1}`);
        const params = { page: page + 1 };
        return this.apiRequest<MaterialsListDto>({ url: '/materials/', params });
    }

    public static async getAll(): Promise<MaterialDto[] | undefined> {
        console.log(`MaterialsApiClient.getAll`);
        const params = { page: 1, pageSize: 100 };
        const data = await this.apiRequest<MaterialsListDto>({ url: '/materials/', params });
        return data?.entries;
    }

    public static async create(data: CreateMaterialFormData): Promise<void> {
        console.log(`MaterialsApiClient.create: data`);
        await this.apiRequest<void>({ url: '/materials/', data: data, method: 'POST' });
    }

    public static async getById(id: number): Promise<MaterialDto | undefined> {
        console.log(`MaterialsApiClient.getById: ${id}`);
        const params = { page: 1, pageSize: 100 };
        const data = await this.apiRequest<MaterialsListDto>({ url: '/materials/', params });
        return data?.entries.find((m) => m.id === id);
    }

    public static async update(id: number, data: UpdateMaterialFormData): Promise<void> {
        console.log(`MaterialsApiClient.update: id=${id}, data`);
        await this.apiRequest<void>({ url: `/materials/${id}/`, data: data, method: 'PATCH' });
    }
}
