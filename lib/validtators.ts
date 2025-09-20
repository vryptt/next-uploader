import { z } from 'zod';
import { APP_CONFIG } from './config';

export const uploadSchema = z.object({
  duration: z.enum([
    '1hour', '6hours', '12hours', '1day', 
    '7days', '14days', '30days', 'unlimited'
  ]).optional().default('7days'),
  metadata: z.object({
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional()
});

export const fileQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['uploadedAt', 'size', 'name']).default('uploadedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  extension: z.string().optional(),
});

// Validation untuk file
export function validateFile(file: File) {
  const errors: string[] = [];
  
  // Validasi ukuran
  if (!file.size || file.size === 0) {
    errors.push('File kosong');
  } else if (file.size > APP_CONFIG.upload.maxFileSize) {
    errors.push(`Ukuran file melebihi batas maksimum ${APP_CONFIG.upload.maxFileSize / 1024 / 1024}MB`);
  }

  // Validasi nama file
  if (!file.name || file.name.trim() === '') {
    errors.push('Nama file tidak valid');
  }

  // Validasi extension
  const extension = path.extname(file.name).toLowerCase();
  if (!APP_CONFIG.upload.allowedExtensions.includes(extension)) {
    errors.push(`Tipe file ${extension} tidak diizinkan`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}