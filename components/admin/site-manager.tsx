"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  deleteSiteAction,
  reorderSitesAction,
  saveSiteAction,
  toggleSiteAction
} from "@/app/[locale]/admin/actions";
import { resolveActionMessage } from "@/components/admin/action-message";
import { SiteIcon } from "@/components/site-icon";
import type { ActionState, Category, Locale, Site } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { normalizeForSearch } from "@/lib/utils";

const initialState: ActionState = { ok: false };

type StatusFilter = "all" | "visible" | "hidden" | "featured";

export function SiteManager({
  locale,
  dictionary,
  categories,
  sites
}: {
  locale: Locale;
  dictionary: Dictionary;
  categories: Category[];
  sites: Site[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Site | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const reorderEnabled = !query.trim() && statusFilter === "all";

  const filteredSites = useMemo(() => {
    const needle = normalizeForSearch(query);
    return sites.filter((site) => {
      if (categoryFilter !== "all" && site.categoryId !== categoryFilter) return false;
      if (statusFilter === "visible" && !site.isVisible) return false;
      if (statusFilter === "hidden" && site.isVisible) return false;
      if (statusFilter === "featured" && !site.isFeatured) return false;
      if (!needle) return true;
      const category = categories.find((item) => item.id === site.categoryId);
      const haystack = normalizeForSearch([
        site.name.zh,
        site.name.en,
        site.description.zh,
        site.description.en,
        site.domain,
        category?.name.zh,
        category?.name.en
      ].filter(Boolean).join(" "));
      return needle.split(" ").every((token) => haystack.includes(token));
    });
  }, [categories, categoryFilter, query, sites, statusFilter]);

  const groups = useMemo(
    () =>
      categories
        .filter((category) => categoryFilter === "all" || category.id === categoryFilter)
        .map((category) => ({
          category,
          sites: filteredSites
            .filter((site) => site.categoryId === category.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        }))
        .filter((group) => group.sites.length > 0),
    [categories, categoryFilter, filteredSites]
  );

  function report(state: ActionState) {
    setMessage(resolveActionMessage(dictionary, state));
  }

  function closeEditor() {
    dialogRef.current?.close();
    setEditing(null);
    setFieldErrors({});
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
  }

  function openEditor(site: Site | null) {
    setEditing(site);
    setFieldErrors({});
    setFilePreview(null);
    setMessage(null);
    dialogRef.current?.showModal();
  }

  function reorderCategory(categoryId: string, ordered: Site[]) {
    const fullCategorySites = sites
      .filter((site) => site.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const order = ordered.map((site) => site.id);
    const allIds = fullCategorySites.map((site) => site.id);
    if (order.length !== allIds.length || allIds.some((id) => !order.includes(id))) return;
    startTransition(async () => {
      const state = await reorderSitesAction(categoryId, order);
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function moveSite(groupSites: Site[], index: number, direction: -1 | 1) {
    const target = index + direction;
    if (!reorderEnabled || target < 0 || target >= groupSites.length) return;
    const next = [...groupSites];
    [next[index], next[target]] = [next[target], next[index]];
    reorderCategory(groupSites[index].categoryId, next);
  }

  function dropOn(groupSites: Site[], targetId: string) {
    if (!reorderEnabled || !draggedId || draggedId === targetId) return;
    const from = groupSites.findIndex((site) => site.id === draggedId);
    const to = groupSites.findIndex((site) => site.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...groupSites];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    reorderCategory(groupSites[0].categoryId, next);
    setDraggedId(null);
  }

  function toggle(site: Site, field: "is_visible" | "is_featured", value: boolean) {
    startTransition(async () => {
      const state = await toggleSiteAction(site.id, field, value);
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function remove(site: Site) {
    if (!window.confirm(dictionary.common.confirmDelete)) return;
    startTransition(async () => {
      const state = await deleteSiteAction(site.id);
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFieldErrors({});
    startTransition(async () => {
      const state = await saveSiteAction(initialState, formData);
      if (!state.ok) {
        setFieldErrors(state.fieldErrors ?? {});
        report(state);
        return;
      }
      report(state);
      closeEditor();
      router.refresh();
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (filePreview) URL.revokeObjectURL(filePreview);
    const file = event.target.files?.[0];
    setFilePreview(file ? URL.createObjectURL(file) : null);
  }

  function clearFilters() {
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  return (
    <>
      <div className="manager-toolbar">
        <div className="search-control">
          <Search aria-hidden="true" />
          <input
            className="input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dictionary.admin.searchSites}
            aria-label={dictionary.admin.searchSites}
          />
        </div>
        <select
          className="select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label={dictionary.admin.filterCategory}
          style={{ width: "auto", minWidth: 160 }}
        >
          <option value="all">{dictionary.common.all}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name[locale]}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          aria-label={dictionary.admin.filterStatus}
          style={{ width: "auto", minWidth: 130 }}
        >
          <option value="all">{dictionary.common.all}</option>
          <option value="visible">{dictionary.common.visible}</option>
          <option value="hidden">{dictionary.common.hidden}</option>
          <option value="featured">{dictionary.common.featured}</option>
        </select>
        <button className="button button-primary" type="button" onClick={() => openEditor(null)} disabled={!categories.length}>
          <Plus aria-hidden="true" />
          {dictionary.admin.addSite}
        </button>
      </div>

      {!reorderEnabled ? (
        <p className="form-hint" style={{ marginBottom: 12 }}>
          {dictionary.admin.dragToSort}: {dictionary.common.all} / {dictionary.common.visible}
        </p>
      ) : null}

      {message ? (
        <p className={`form-message ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"} style={{ marginBottom: 16 }}>
          {message.text}
        </p>
      ) : null}

      {groups.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {groups.map(({ category, sites: groupSites }) => (
            <section key={category.id}>
              <div className="panel-heading">
                <h2>{category.name[locale]}</h2>
                <span className="muted" style={{ fontSize: 10 }}>{groupSites.length} {dictionary.common.sites}</span>
              </div>
              <div className="manager-list">
                {groupSites.map((site, index) => (
                  <div
                    className={`manager-row ${draggedId === site.id ? "is-dragging" : ""}`}
                    key={site.id}
                    draggable={reorderEnabled && !isPending}
                    onDragStart={(event) => {
                      setDraggedId(site.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", site.id);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropOn(groupSites, site.id)}
                  >
                    <span className="drag-handle" aria-hidden="true" title={dictionary.admin.dragToSort}>
                      <GripVertical />
                    </span>
                    <SiteIcon name={site.name[locale]} url={site.url} iconUrl={site.iconUrl} className="mini-site-icon" />
                    <div className="manager-copy">
                      <strong>{site.name[locale]}</strong>
                      <small>{site.domain} · {site.description[locale]}</small>
                    </div>
                    <div className="manager-row-actions">
                      <button
                        className={`status-pill ${site.isFeatured ? "is-featured" : "is-hidden"}`}
                        type="button"
                        onClick={() => toggle(site, "is_featured", !site.isFeatured)}
                        disabled={isPending}
                        title={dictionary.admin.isFeatured}
                      >
                        <Star aria-hidden="true" />
                        {dictionary.common.featured}
                      </button>
                      <button
                        className={`status-pill ${site.isVisible ? "" : "is-hidden"}`}
                        type="button"
                        onClick={() => toggle(site, "is_visible", !site.isVisible)}
                        disabled={isPending}
                        title={dictionary.common.status}
                      >
                        {site.isVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                        {site.isVisible ? dictionary.common.visible : dictionary.common.hidden}
                      </button>
                      <button className="icon-button button-small" type="button" onClick={() => moveSite(groupSites, index, -1)} disabled={!reorderEnabled || index === 0 || isPending} aria-label={dictionary.admin.moveUp} title={dictionary.admin.moveUp}>
                        <ArrowUp aria-hidden="true" />
                      </button>
                      <button className="icon-button button-small" type="button" onClick={() => moveSite(groupSites, index, 1)} disabled={!reorderEnabled || index === groupSites.length - 1 || isPending} aria-label={dictionary.admin.moveDown} title={dictionary.admin.moveDown}>
                        <ArrowDown aria-hidden="true" />
                      </button>
                      <button className="icon-button button-small" type="button" onClick={() => openEditor(site)} disabled={isPending} aria-label={`${dictionary.common.edit}: ${site.name[locale]}`} title={dictionary.common.edit}>
                        <Pencil aria-hidden="true" />
                      </button>
                      <button className="icon-button button-small" type="button" onClick={() => remove(site)} disabled={isPending} aria-label={`${dictionary.admin.deleteSite}: ${site.name[locale]}`} title={dictionary.admin.deleteSite}>
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">拾</span>
          <h3>{dictionary.admin.noSites}</h3>
          <button className="text-button" type="button" onClick={clearFilters}>{dictionary.home.clearFilters}</button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="dialog"
        onClose={() => {
          setEditing(null);
          setFieldErrors({});
          if (filePreview) URL.revokeObjectURL(filePreview);
          setFilePreview(null);
        }}
      >
        <div className="dialog-body">
          <div className="dialog-header">
            <h2>{editing ? dictionary.admin.editSite : dictionary.admin.createSite}</h2>
            <button className="native-dialog-close" type="button" onClick={closeEditor} aria-label={dictionary.common.close}>
              <X aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={submit}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="site-category">{dictionary.admin.siteCategory}</label>
                <select className="select" id="site-category" name="categoryId" defaultValue={editing?.categoryId ?? categories[0]?.id} required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name[locale]} / {category.name[locale === "zh" ? "en" : "zh"]}</option>
                  ))}
                </select>
                {fieldErrors.categoryId ? <span className="field-error">{fieldErrors.categoryId}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="site-name-zh">{dictionary.admin.nameZh}</label>
                <input className="input" id="site-name-zh" name="nameZh" defaultValue={editing?.name.zh ?? ""} maxLength={80} required />
                {fieldErrors.nameZh ? <span className="field-error">{fieldErrors.nameZh}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="site-name-en">{dictionary.admin.nameEn}</label>
                <input className="input" id="site-name-en" name="nameEn" defaultValue={editing?.name.en ?? ""} maxLength={80} required />
                {fieldErrors.nameEn ? <span className="field-error">{fieldErrors.nameEn}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="site-description-zh">{dictionary.admin.descriptionZh}</label>
                <textarea className="textarea" id="site-description-zh" name="descriptionZh" defaultValue={editing?.description.zh ?? ""} maxLength={300} rows={3} required />
                {fieldErrors.descriptionZh ? <span className="field-error">{fieldErrors.descriptionZh}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="site-description-en">{dictionary.admin.descriptionEn}</label>
                <textarea className="textarea" id="site-description-en" name="descriptionEn" defaultValue={editing?.description.en ?? ""} maxLength={300} rows={3} required />
                {fieldErrors.descriptionEn ? <span className="field-error">{fieldErrors.descriptionEn}</span> : null}
              </div>
              <div className="form-field full">
                <label htmlFor="site-url">{dictionary.admin.url}</label>
                <input className="input" id="site-url" name="url" type="url" defaultValue={editing?.url ?? ""} placeholder="https://" required />
                {fieldErrors.url ? <span className="field-error">{fieldErrors.url}</span> : null}
              </div>
              <div className="form-field full">
                <label htmlFor="site-icon-url">{dictionary.admin.iconUrl}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {filePreview ? (
                    <span className="site-icon mini-site-icon"><img src={filePreview} alt="" /></span>
                  ) : (
                    <SiteIcon
                      key={`${editing?.id ?? "new"}:${editing?.url ?? ""}:${editing?.iconUrl ?? ""}`}
                      name={editing?.name[locale] ?? "拾"}
                      url={editing?.url ?? ""}
                      iconUrl={editing?.iconUrl ?? null}
                      className="mini-site-icon"
                    />
                  )}
                  <input className="input" id="site-icon-url" name="iconUrl" type="url" defaultValue={editing?.iconUrl ?? ""} placeholder="https://" />
                </div>
                {fieldErrors.iconUrl ? <span className="field-error">{fieldErrors.iconUrl}</span> : null}
              </div>
              <div className="form-field full">
                <label htmlFor="site-icon-file">{dictionary.admin.iconUpload}</label>
                <label className="button button-small" style={{ alignSelf: "flex-start" }} htmlFor="site-icon-file">
                  <ImagePlus aria-hidden="true" />
                  {dictionary.admin.chooseIcon}
                </label>
                <input className="sr-only" id="site-icon-file" name="iconFile" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
                <span className="form-hint">{dictionary.admin.iconHint}</span>
                {fieldErrors.iconFile ? <span className="field-error">{fieldErrors.iconFile}</span> : null}
              </div>
              <label className="checkbox-line">
                <input type="checkbox" name="isVisible" defaultChecked={editing?.isVisible ?? true} />
                {dictionary.admin.isVisible}
              </label>
              <label className="checkbox-line">
                <input type="checkbox" name="isFeatured" defaultChecked={editing?.isFeatured ?? false} />
                {dictionary.admin.isFeatured}
              </label>
              {editing?.iconUrl || filePreview ? (
                <label className="checkbox-line full">
                  <input type="checkbox" name="removeIcon" />
                  {dictionary.admin.removeIcon}
                </label>
              ) : null}
            </div>
            {message?.error ? <p className="form-message is-error" role="alert" style={{ marginTop: 18 }}>{message.text}</p> : null}
            <div className="form-actions">
              <button className="button" type="button" onClick={closeEditor}>{dictionary.common.cancel}</button>
              <button className="button button-primary" type="submit" disabled={isPending}>
                {isPending ? dictionary.common.saving : dictionary.common.save}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}



