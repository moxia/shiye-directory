"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdminClient } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  booleanFromForm,
  catalogImportSchema,
  categoryFormSchema,
  formText,
  passwordFormSchema,
  settingsFormSchema,
  siteFormSchema
} from "@/lib/validation";
import type { ActionState, ImportSummary } from "@/lib/types";

const ICON_BUCKET = "site-icons";
const MAX_ICON_SIZE = 512 * 1024;
const ALLOWED_ICON_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function fieldErrors(error: z.ZodError): Record<string, string> {
  const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flattened).map(([key, messages]) => [key, messages?.[0] ?? "invalid"])
  );
}

function actionError<T = unknown>(message = "generic", errors?: Record<string, string>): ActionState<T> {
  return { ok: false, message, fieldErrors: errors };
}

function revalidateCatalog() {
  revalidateTag("catalog", "max");
  for (const locale of ["zh", "en"] as const) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}/admin/categories`);
    revalidatePath(`/${locale}/admin/sites`);
    revalidatePath(`/${locale}/admin/settings`);
    revalidatePath(`/${locale}/admin/data`);
  }
}

function databaseErrorCode(error: { code?: string; message?: string } | null) {
  if (!error) return "generic";
  if (error.code === "23505") {
    return error.message?.includes("url") ? "duplicateUrl" : "duplicateSlug";
  }
  return "generic";
}

export async function loginAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = formText(formData, "locale") === "en" ? "en" : "zh";
  const email = formText(formData, "email");
  const password = formText(formData, "password");
  const supabase = await createServerSupabaseClient();

  if (!supabase) return actionError("setupRequired");
  if (!email || !password) return actionError("loginError");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || data.user?.app_metadata?.role !== "admin") {
    if (data.user) await supabase.auth.signOut();
    return actionError("loginError");
  }

  redirect(`/${locale}/admin`);
}

export async function logoutAction(formData: FormData) {
  const locale = formText(formData, "locale") === "en" ? "en" : "zh";
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  redirect(`/${locale}/admin/login`);
}

export async function saveCategoryAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = categoryFormSchema.safeParse({
    id: formText(formData, "id"),
    slug: formText(formData, "slug"),
    nameZh: formText(formData, "nameZh"),
    nameEn: formText(formData, "nameEn"),
    descriptionZh: formText(formData, "descriptionZh"),
    descriptionEn: formText(formData, "descriptionEn"),
    isVisible: booleanFromForm(formData, "isVisible")
  });

  if (!parsed.success) return actionError("invalid", fieldErrors(parsed.error));

  try {
    const { supabase } = await requireAdminClient();
    const value = parsed.data;
    const payload = {
      slug: value.slug,
      name_zh: value.nameZh,
      name_en: value.nameEn,
      description_zh: value.descriptionZh,
      description_en: value.descriptionEn,
      is_visible: value.isVisible
    };

    let error;
    if (value.id) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", value.id));
    } else {
      const { data: last } = await supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      ({ error } = await supabase.from("categories").insert({
        ...payload,
        sort_order: (last?.sort_order ?? 0) + 10
      }));
    }

    if (error) return actionError(databaseErrorCode(error));
    revalidateCatalog();
    return { ok: true, message: "saved" };
  } catch (error) {
    return actionError(
      error instanceof Error && error.message === "UNAUTHORIZED" ? "sessionExpired" : "generic"
    );
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  if (!z.string().uuid().safeParse(id).success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { count, error: countError } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if (countError) return actionError("generic");
    if ((count ?? 0) > 0) return actionError("categoryHasSites");

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return actionError(databaseErrorCode(error));
    revalidateCatalog();
    return { ok: true, message: "deleted" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function toggleCategoryAction(id: string, isVisible: boolean): Promise<ActionState> {
  if (!z.string().uuid().safeParse(id).success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_visible: isVisible })
      .eq("id", id);
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "saved" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function reorderCategoriesAction(ids: string[]): Promise<ActionState> {
  const parsed = z.array(z.string().uuid()).min(1).safeParse(ids);
  if (!parsed.success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase.rpc("reorder_categories", { p_category_ids: parsed.data });
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "reordered" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function saveSiteAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = siteFormSchema.safeParse({
    id: formText(formData, "id"),
    categoryId: formText(formData, "categoryId"),
    nameZh: formText(formData, "nameZh"),
    nameEn: formText(formData, "nameEn"),
    descriptionZh: formText(formData, "descriptionZh"),
    descriptionEn: formText(formData, "descriptionEn"),
    url: formText(formData, "url"),
    iconUrl: formText(formData, "iconUrl"),
    isVisible: booleanFromForm(formData, "isVisible"),
    isFeatured: booleanFromForm(formData, "isFeatured")
  });

  if (!parsed.success) return actionError("invalid", fieldErrors(parsed.error));

  try {
    const { supabase } = await requireAdminClient();
    const value = parsed.data;
    let iconUrl = booleanFromForm(formData, "removeIcon") ? null : value.iconUrl;
    const iconFile = formData.get("iconFile");

    if (iconFile instanceof File && iconFile.size > 0) {
      if (iconFile.size > MAX_ICON_SIZE || !ALLOWED_ICON_TYPES.has(iconFile.type)) {
        return actionError<ImportSummary>("invalidFile");
      }

      const input = Buffer.from(await iconFile.arrayBuffer());
      const sharp = (await import("sharp")).default;
      const metadata = await sharp(input).metadata();
      if (!metadata.format || !["png", "jpeg", "webp"].includes(metadata.format)) {
        return actionError<ImportSummary>("invalidFile");
      }

      const output = await sharp(input)
        .rotate()
        .resize(128, 128, { fit: "cover", position: "centre" })
        .webp({ quality: 84 })
        .toBuffer();
      const path = `${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(ICON_BUCKET)
        .upload(path, output, { contentType: "image/webp", upsert: false });
      if (uploadError) return actionError<ImportSummary>("invalidFile");
      iconUrl = supabase.storage.from(ICON_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const payload = {
      category_id: value.categoryId,
      name_zh: value.nameZh,
      name_en: value.nameEn,
      description_zh: value.descriptionZh,
      description_en: value.descriptionEn,
      url: value.url,
      icon_url: iconUrl,
      is_visible: value.isVisible,
      is_featured: value.isFeatured
    };

    let error;
    if (value.id) {
      const { data: current } = await supabase
        .from("sites")
        .select("category_id,sort_order")
        .eq("id", value.id)
        .maybeSingle();
      let sortOrder = current?.sort_order;
      if (current?.category_id !== value.categoryId) {
        const { data: last } = await supabase
          .from("sites")
          .select("sort_order")
          .eq("category_id", value.categoryId)
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle();
        sortOrder = (last?.sort_order ?? 0) + 10;
      }
      ({ error } = await supabase
        .from("sites")
        .update({ ...payload, sort_order: sortOrder })
        .eq("id", value.id));
    } else {
      const { data: last } = await supabase
        .from("sites")
        .select("sort_order")
        .eq("category_id", value.categoryId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      ({ error } = await supabase.from("sites").insert({
        ...payload,
        sort_order: (last?.sort_order ?? 0) + 10
      }));
    }

    if (error) return actionError(databaseErrorCode(error));
    revalidateCatalog();
    return { ok: true, message: "saved" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function deleteSiteAction(id: string): Promise<ActionState> {
  if (!z.string().uuid().safeParse(id).success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "deleted" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function toggleSiteAction(
  id: string,
  field: "is_visible" | "is_featured",
  value: boolean
): Promise<ActionState> {
  if (!z.string().uuid().safeParse(id).success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase.from("sites").update({ [field]: value }).eq("id", id);
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "saved" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function reorderSitesAction(categoryId: string, ids: string[]): Promise<ActionState> {
  const parsed = z
    .object({ categoryId: z.string().uuid(), ids: z.array(z.string().uuid()).min(1) })
    .safeParse({ categoryId, ids });
  if (!parsed.success) return actionError("generic");
  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase.rpc("reorder_sites", {
      p_category_id: parsed.data.categoryId,
      p_site_ids: parsed.data.ids
    });
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "reordered" };
  } catch {
    return actionError("sessionExpired");
  }
}


export async function saveSettingsAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = settingsFormSchema.safeParse({
    siteNameZh: formText(formData, "siteNameZh"),
    siteNameEn: formText(formData, "siteNameEn"),
    taglineZh: formText(formData, "taglineZh"),
    taglineEn: formText(formData, "taglineEn"),
    introZh: formText(formData, "introZh"),
    introEn: formText(formData, "introEn"),
    seoTitleZh: formText(formData, "seoTitleZh"),
    seoTitleEn: formText(formData, "seoTitleEn"),
    seoDescriptionZh: formText(formData, "seoDescriptionZh"),
    seoDescriptionEn: formText(formData, "seoDescriptionEn"),
    footerZh: formText(formData, "footerZh"),
    footerEn: formText(formData, "footerEn")
  });

  if (!parsed.success) return actionError("invalid", fieldErrors(parsed.error));

  try {
    const { supabase } = await requireAdminClient();
    const value = parsed.data;
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "main",
        site_name_zh: value.siteNameZh,
        site_name_en: value.siteNameEn,
        tagline_zh: value.taglineZh,
        tagline_en: value.taglineEn,
        intro_zh: value.introZh,
        intro_en: value.introEn,
        seo_title_zh: value.seoTitleZh,
        seo_title_en: value.seoTitleEn,
        seo_description_zh: value.seoDescriptionZh,
        seo_description_en: value.seoDescriptionEn,
        footer_text_zh: value.footerZh,
        footer_text_en: value.footerEn
      },
      { onConflict: "id" }
    );
    if (error) return actionError("generic");
    revalidateCatalog();
    return { ok: true, message: "saved" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function changePasswordAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = passwordFormSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? "")
  });
  if (!parsed.success) return actionError("invalid", fieldErrors(parsed.error));

  try {
    const { supabase } = await requireAdminClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return actionError("generic");
    return { ok: true, message: "passwordUpdated" };
  } catch {
    return actionError("sessionExpired");
  }
}

export async function importCatalogAction(
  _previousState: ActionState<ImportSummary>,
  formData: FormData
): Promise<ActionState<ImportSummary>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0 || file.size > 2 * 1024 * 1024) {
    return actionError<ImportSummary>("invalidFile");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(await file.text());
  } catch {
    return actionError<ImportSummary>("invalidFile");
  }

  const parsed = catalogImportSchema.safeParse(raw);
  if (!parsed.success) return actionError<ImportSummary>("importError", fieldErrors(parsed.error));

  try {
    const { supabase } = await requireAdminClient();
    const { data, error } = await supabase.rpc("import_catalog", {
      p_payload: parsed.data
    });
    if (error) return actionError<ImportSummary>("importError");
    const summary = (data ?? {}) as Partial<ImportSummary>;
    revalidateCatalog();
    return {
      ok: true,
      message: "imported",
      data: {
        categoriesCreated: Number(summary.categoriesCreated ?? 0),
        categoriesUpdated: Number(summary.categoriesUpdated ?? 0),
        sitesCreated: Number(summary.sitesCreated ?? 0),
        sitesUpdated: Number(summary.sitesUpdated ?? 0)
      }
    };
  } catch {
    return actionError<ImportSummary>("sessionExpired");
  }
}



