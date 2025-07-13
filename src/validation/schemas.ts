import z from 'zod';

export const createMaterialSchema = z.object({
    name: z.string().nonempty('Це поле є обовʼязковим'),
    price: z.number({ message: 'Введіть число' }).positive('Вартість повинна бути більшою за 0'),
});

export type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;

export const createEmployeeSchema = z.object({
    fullName: z.string().nonempty('Це поле є обовʼязковим'),
    phoneNumber: z
        .string()
        .nonempty('Це поле є обовʼязковим')
        .regex(/^\s*(\+38)?\d{10}\s*$/im, { message: 'Неправильний формат' }),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
