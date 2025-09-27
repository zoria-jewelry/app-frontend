export interface AppConfig {
    apiBase: string;
    vchasnoApiBase: string;
}

export const config: AppConfig = {
    apiBase: import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/jwlr',
    vchasnoApiBase: import.meta.env.VITE_VCHASNO_API_BASE || 'http://localhost:3939',
};
