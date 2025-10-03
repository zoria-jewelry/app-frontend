import { AbstractApiClient } from './abstractApiClient.ts';
import type { SignInFormData } from '../validation/schemas.ts';

export class AuthApiClient extends AbstractApiClient {
    public static async signIn(data: SignInFormData): Promise<void> {
        console.log(`AuthApiClient.signIn: email - ${JSON.stringify(data.email)}`);
        await this.apiRequest<void>({ url: '/login/', method: 'POST', data });
    }
}
