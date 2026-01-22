import { z } from "zod";

// Brazilian phone regex - accepts formats like (11) 99999-9999, 11999999999, etc.
const brazilianPhoneRegex = /^(\(?[0-9]{2}\)?[\s.-]?)?[0-9]{4,5}[-.\s]?[0-9]{4}$/;

// Common validation schemas
export const phoneSchema = z
  .string()
  .trim()
  .regex(brazilianPhoneRegex, "Formato de telefone inválido. Use (XX) XXXXX-XXXX")
  .or(z.literal(""));

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (val) => val === "" || brazilianPhoneRegex.test(val),
    "Formato de telefone inválido. Use (XX) XXXXX-XXXX"
  )
  .optional();

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres");

export const citySchema = z
  .string()
  .trim()
  .min(2, "Cidade deve ter pelo menos 2 caracteres")
  .max(100, "Cidade deve ter no máximo 100 caracteres");

export const descriptionSchema = z
  .string()
  .trim()
  .max(1000, "Descrição deve ter no máximo 1000 caracteres")
  .optional();

export const emailSchema = z
  .string()
  .trim()
  .email("Email inválido")
  .max(255, "Email deve ter no máximo 255 caracteres");

// Group creation validation
export const createGroupSchema = z.object({
  groupName: z
    .string()
    .trim()
    .min(3, "Nome do grupo deve ter pelo menos 3 caracteres")
    .max(100, "Nome do grupo deve ter no máximo 100 caracteres"),
  city: citySchema,
  leaderName: nameSchema,
  leaderWhatsapp: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || brazilianPhoneRegex.test(val),
      "Formato de telefone inválido. Use (XX) XXXXX-XXXX"
    ),
  description: z
    .string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
  donationType: z.string().min(1, "Selecione um tipo de doação"),
});

// Auth/Signup validation
export const signupSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  whatsapp: z
    .string()
    .trim()
    .refine(
      (val) => brazilianPhoneRegex.test(val),
      "Formato de telefone inválido. Use (XX) XXXXX-XXXX"
    ),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

// Partner submission validation
export const partnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  city: citySchema,
  specialty: z.string().max(100, "Especialidade deve ter no máximo 100 caracteres").optional(),
  whatsapp: optionalPhoneSchema,
  description: z
    .string()
    .trim()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  instagram: z.string().max(50, "Instagram deve ter no máximo 50 caracteres").optional(),
  responsible: z.string().max(100, "Responsável deve ter no máximo 100 caracteres").optional(),
});

// Helper function to get first validation error message
export function getValidationError(schema: z.ZodSchema, data: unknown): string | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    return result.error.errors[0]?.message || "Dados inválidos";
  }
  return null;
}

// Helper function to validate and return all errors
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (path && !errors[path]) {
        errors[path] = err.message;
      }
    });
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}
