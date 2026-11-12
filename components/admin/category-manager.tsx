"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  saveCategoryAction,
  toggleCategoryAction
} from "@/app/[locale]/admin/actions";
import { resolveActionMessage } from "@/components/admin/action-message";
import type { Locale, ActionState, Category } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

const initialState: ActionState = { ok: false };

export function CategoryManager({
  locale,
  dictionary,
  categories
}: {
  locale: Locale;
  dictionary: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function openEditor(category: Category | null) {
    setEditing(category);
    setFieldErrors({});
    dialogRef.current?.showModal();
  }

  function closeEditor() {
    dialogRef.current?.close();
    setEditing(null);
  }

  function report(state: ActionState) {
    setMessage(resolveActionMessage(dictionary, state));
  }

  function reorder(next: Category[]) {
    if (next.every((category, index) => category.id === categories[index]?.id)) return;
    startTransition(async () => {
      const state = await reorderCategoriesAction(next.map((category) => category.id));
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    reorder(next);
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const from = categories.findIndex((category) => category.id === draggedId);
    const to = categories.findIndex((category) => category.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...categories];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    reorder(next);
    setDraggedId(null);
  }

  function toggle(category: Category) {
    startTransition(async () => {
      const state = await toggleCategoryAction(category.id, !category.isVisible);
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function remove(category: Category) {
    if (!window.confirm(dictionary.common.confirmDelete)) return;
    startTransition(async () => {
      const state = await deleteCategoryAction(category.id);
      report(state);
      if (state.ok) router.refresh();
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFieldErrors({});
    startTransition(async () => {
      const state = await saveCategoryAction(initialState, formData);
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

  return (
    <>
      <div className="manager-toolbar">
        <div className="admin-actions">
          <button className="button button-primary" type="button" onClick={() => openEditor(null)}>
            <Plus aria-hidden="true" />
            {dictionary.admin.addCategory}
          </button>
        </div>
        <span className="muted" style={{ marginLeft: "auto", fontSize: 11 }}>
          {categories.length} {dictionary.common.categories}
        </span>
      </div>

      {categories.length ? (
        <div className="manager-list">
          {categories.map((category, index) => (
            <div
              className={`manager-row ${draggedId === category.id ? "is-dragging" : ""}`}
              draggable={!isPending}
              key={category.id}
              onDragStart={(event) => {
                setDraggedId(category.id);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", category.id);
              }}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(category.id)}
            >
              <span className="drag-handle" aria-hidden="true" title={dictionary.admin.dragToSort}>
                <GripVertical />
              </span>
              <span className="site-icon mini-site-icon" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </span>
              <div className="manager-copy">
                <strong>{category.name[locale]}</strong>
                <small>/{category.slug} · {category.siteCount} {dictionary.common.sites}</small>
              </div>
              <div className="manager-row-actions">
                <button
                  className={`status-pill ${category.isVisible ? "" : "is-hidden"}`}
                  type="button"
                  onClick={() => toggle(category)}
                  disabled={isPending}
                  title={dictionary.common.status}
                >
                  {category.isVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                  {category.isVisible ? dictionary.common.visible : dictionary.common.hidden}
                </button>
                <button className="icon-button button-small" type="button" onClick={() => move(index, -1)} disabled={index === 0 || isPending} aria-label={dictionary.admin.moveUp} title={dictionary.admin.moveUp}>
                  <ArrowUp aria-hidden="true" />
                </button>
                <button className="icon-button button-small" type="button" onClick={() => move(index, 1)} disabled={index === categories.length - 1 || isPending} aria-label={dictionary.admin.moveDown} title={dictionary.admin.moveDown}>
                  <ArrowDown aria-hidden="true" />
                </button>
                <button className="icon-button button-small" type="button" onClick={() => openEditor(category)} disabled={isPending} aria-label={`${dictionary.common.edit}: ${category.name.zh}`} title={dictionary.common.edit}>
                  <Pencil aria-hidden="true" />
                </button>
                <button className="icon-button button-small" type="button" onClick={() => remove(category)} disabled={isPending || category.siteCount > 0} aria-label={`${dictionary.admin.deleteCategory}: ${category.name.zh}`} title={dictionary.admin.deleteCategory}>
                  <Trash2 aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">拾</span>
          <h3>{dictionary.admin.noCategories}</h3>
          <button className="text-button" type="button" onClick={() => openEditor(null)}>{dictionary.admin.createCategory}</button>
        </div>
      )}

      {message ? (
        <p className={`form-message ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"} style={{ marginTop: 16 }}>
          {message.text}
        </p>
      ) : null}

      <dialog ref={dialogRef} className="dialog" onClose={() => setEditing(null)}>
        <div className="dialog-body">
          <div className="dialog-header">
            <h2>{editing ? dictionary.admin.editCategory : dictionary.admin.createCategory}</h2>
            <button className="native-dialog-close" type="button" onClick={closeEditor} aria-label={dictionary.common.close}>
              <X aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={submit}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="form-grid">
              <div className="form-field full">
                <label htmlFor="category-slug">{dictionary.admin.slug}</label>
                <input
                  className="input"
                  id="category-slug"
                  name="slug"
                  defaultValue={editing?.slug ?? ""}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  maxLength={60}
                  required
                  autoComplete="off"
                />
                <span className="form-hint">{dictionary.admin.slugHint}</span>
                {fieldErrors.slug ? <span className="field-error">{fieldErrors.slug}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="category-name-zh">{dictionary.admin.nameZh}</label>
                <input className="input" id="category-name-zh" name="nameZh" defaultValue={editing?.name.zh ?? ""} maxLength={80} required />
                {fieldErrors.nameZh ? <span className="field-error">{fieldErrors.nameZh}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="category-name-en">{dictionary.admin.nameEn}</label>
                <input className="input" id="category-name-en" name="nameEn" defaultValue={editing?.name.en ?? ""} maxLength={80} required />
                {fieldErrors.nameEn ? <span className="field-error">{fieldErrors.nameEn}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="category-description-zh">{dictionary.admin.descriptionZh}</label>
                <textarea className="textarea" id="category-description-zh" name="descriptionZh" defaultValue={editing?.description.zh ?? ""} maxLength={300} rows={4} required />
                {fieldErrors.descriptionZh ? <span className="field-error">{fieldErrors.descriptionZh}</span> : null}
              </div>
              <div className="form-field">
                <label htmlFor="category-description-en">{dictionary.admin.descriptionEn}</label>
                <textarea className="textarea" id="category-description-en" name="descriptionEn" defaultValue={editing?.description.en ?? ""} maxLength={300} rows={4} required />
                {fieldErrors.descriptionEn ? <span className="field-error">{fieldErrors.descriptionEn}</span> : null}
              </div>
              <label className="checkbox-line full">
                <input type="checkbox" name="isVisible" defaultChecked={editing?.isVisible ?? true} />
                {dictionary.admin.isVisible}
              </label>
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


