"use client";

import { FileJson, Upload } from "lucide-react";
import { useActionState } from "react";
import { importCatalogAction } from "@/app/[locale]/admin/actions";
import { resolveActionMessage } from "@/components/admin/action-message";
import { formatMessage, type Dictionary } from "@/lib/i18n";
import type { ActionState, ImportSummary } from "@/lib/types";

const initialState: ActionState<ImportSummary> = { ok: false };

export function DataTools({ dictionary }: { dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(importCatalogAction, initialState);
  const message = state.ok ? null : resolveActionMessage(dictionary, state);
  const summary = state.ok && state.data
    ? formatMessage(dictionary.admin.importSuccess, { ...state.data })
    : null;

  return (
    <div className="data-grid">
      <section className="data-block">
        <FileJson aria-hidden="true" size={20} />
        <h2>{dictionary.admin.exportJson}</h2>
        <p>{dictionary.admin.exportHint}</p>
        <a className="button" href="/api/admin/export" download>
          {dictionary.admin.exportJson}
        </a>
      </section>
      <section className="data-block">
        <Upload aria-hidden="true" size={20} />
        <h2>{dictionary.admin.importJson}</h2>
        <p>{dictionary.admin.importHint}</p>
        <form action={action} className="login-form">
          <label className="button button-small" htmlFor="catalog-import" style={{ alignSelf: "flex-start" }}>
            {dictionary.admin.chooseFile}
          </label>
          <input className="sr-only" id="catalog-import" name="file" type="file" accept="application/json,.json" required />
          <button className="button button-primary" type="submit" disabled={pending}>
            <Upload aria-hidden="true" />
            {pending ? dictionary.admin.importNow : dictionary.admin.importNow}
          </button>
        </form>
        {message ? <p className={`form-message import-summary ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p> : null}
        {summary ? <p className="form-message import-summary" role="status">{summary}</p> : null}
      </section>
    </div>
  );
}

