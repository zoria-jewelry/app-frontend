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

export const signinSchema = z.object({
    email: z.string().nonempty('Введіть електронну адресу'),
    password: z.string().nonempty('Введіть пароль'),
});

export type SigninFormData = z.infer<typeof signinSchema>;

export const createProductSchema = z.object({
    name: z.string().nonempty('Це поле є обовʼязковим'),
    article: z.string().nonempty('Це поле є обовʼязковим'),
    pictureBase64: z.string().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
