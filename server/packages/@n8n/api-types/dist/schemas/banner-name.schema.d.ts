import { z } from 'zod';
export declare const staticBannerNameSchema: z.ZodEnum<["V1", "TRIAL_OVER", "TRIAL", "NON_PRODUCTION_LICENSE", "EMAIL_CONFIRMATION", "DATA_TABLE_STORAGE_LIMIT_WARNING", "DATA_TABLE_STORAGE_LIMIT_ERROR"]>;
export declare const dynamicBannerNameSchema: z.ZodString;
export declare const bannerNameSchema: z.ZodUnion<[z.ZodEnum<["V1", "TRIAL_OVER", "TRIAL", "NON_PRODUCTION_LICENSE", "EMAIL_CONFIRMATION", "DATA_TABLE_STORAGE_LIMIT_WARNING", "DATA_TABLE_STORAGE_LIMIT_ERROR"]>, z.ZodString]>;
export type BannerName = z.infer<typeof bannerNameSchema>;
