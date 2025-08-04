import { z } from "zod";
import { PageStatus } from "@/generated/prisma";

export const CreatePageSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200个字符"),
  slug: z
    .string()
    .min(1, "URL标识符不能为空")
    .max(100, "URL标识符不能超过100个字符")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "URL标识符只能包含小写字母、数字和连字符"
    ),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().max(500, "摘要不能超过500个字符").optional(),
  status: z.enum(PageStatus).default("DRAFT"),
  publishedAt: z.date().optional(),
  order: z.number().min(0, "排序值不能为负数").default(0),
  template: z.string().max(50, "模板名称不能超过50个字符").optional(),
  featured: z.boolean().default(false),
});

export const UpdatePageSchema = z.object({
  id: z.string().min(1, "ID不能为空"),
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(200, "标题不能超过200个字符")
    .optional(),
  slug: z
    .string()
    .min(1, "URL标识符不能为空")
    .max(100, "URL标识符不能超过100个字符")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "URL标识符只能包含小写字母、数字和连字符"
    )
    .optional(),
  content: z.string().min(1, "内容不能为空").optional(),
  excerpt: z.string().max(500, "摘要不能超过500个字符").optional(),
  status: z.nativeEnum(PageStatus).optional(),
  publishedAt: z.date().optional(),
  order: z.number().min(0, "排序值不能为负数").optional(),
  template: z.string().max(50, "模板名称不能超过50个字符").optional(),
  featured: z.boolean().optional(),
});

export const PageListQuerySchema = z.object({
  page: z.number().min(1, "页码必须大于0").default(1),
  pageSize: z
    .number()
    .min(1, "每页数量必须大于0")
    .max(100, "每页数量不能超过100")
    .default(10),
  status: z.nativeEnum(PageStatus).optional(),
  search: z.string().max(100, "搜索关键词不能超过100个字符").optional(),
  featured: z.boolean().optional(),
  authorId: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "publishedAt", "title", "order"])
    .default("order"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const PageIdSchema = z.object({
  id: z.string().min(1, "ID不能为空"),
});

export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
export type PageListQueryInput = z.infer<typeof PageListQuerySchema>;
export type PageIdInput = z.infer<typeof PageIdSchema>;
