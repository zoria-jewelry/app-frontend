import { AbstractApiClient } from './abstractApiClient.ts';
import Cookies from 'js-cookie';

export interface TokenResponseDto {
    access: string;
    refresh?: string;
}

export class AuthApiClient extends AbstractApiClient {
    public static async signIn(username: string, password: string): Promise<void> {
        console.log(`AuthApiClient.signIn: email - ${JSON.stringify(username)}`);
        const data = { username, password };
        const res = await this.apiRequest<TokenResponseDto>({
            url: '/account/token/',
            method: 'POST',
            data,
        });
        if (!res) {
            throw {};
        }
        Cookies.set('access_token', res.access);
        Cookies.set('refresh_token', res.refresh!);
    }
}
