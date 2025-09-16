export interface AppConfig {
    apiBase: string;
}

export const config: AppConfig = {
    apiBase: import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/jwlr',
};
