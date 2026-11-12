"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/[locale]/admin/actions";
import { resolveActionMessage } from "@/components/admin/action-message";
import type { Dictionary } from "@/lib/i18n";
import type { ActionState, SiteSettings } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function SettingsForm({
  dictionary,
  settings
}: {
  dictionary: Dictionary;
  settings: SiteSettings;
}) {
  const [state, action, pending] = useActionState(saveSettingsAction, initialState);
  const message = resolveActionMessage(dictionary, state);
  const fields = [
    ["siteNameZh", dictionary.admin.siteNameZh, settings.siteName.zh, 80],
    ["siteNameEn", dictionary.admin.siteNameEn, settings.siteName.en, 80],
    ["taglineZh", dictionary.admin.taglineZh, settings.tagline.zh, 120],
    ["taglineEn", dictionary.admin.taglineEn, settings.tagline.en, 120],
    ["seoTitleZh", dictionary.admin.seoTitleZh, settings.seoTitle.zh, 120],
    ["seoTitleEn", dictionary.admin.seoTitleEn, settings.seoTitle.en, 120]
  ] as const;
  const longFields = [
    ["introZh", dictionary.admin.introZh, settings.intro.zh, 400],
    ["introEn", dictionary.admin.introEn, settings.intro.en, 400],
    ["seoDescriptionZh", dictionary.admin.seoDescriptionZh, settings.seoDescription.zh, 300],
    ["seoDescriptionEn", dictionary.admin.seoDescriptionEn, settings.seoDescription.en, 300],
    ["footerZh", dictionary.admin.footerZh, settings.footerText.zh, 240],
    ["footerEn", dictionary.admin.footerEn, settings.footerText.en, 240]
  ] as const;

  return (
    <form action={action} className="settings-form">
      <section className="settings-section">
        <h2>{dictionary.admin.settingsTitle}</h2>
        <div className="form-grid">
          {fields.map(([name, label, value, maxLength]) => (
            <div className="form-field" key={name}>
              <label htmlFor={`settings-${name}`}>{label}</label>
              <input className="input" id={`settings-${name}`} name={name} defaultValue={value} maxLength={maxLength} required />
              {state.fieldErrors?.[name] ? <span className="field-error">{state.fieldErrors[name]}</span> : null}
            </div>
          ))}
        </div>
      </section>
      <section className="settings-section">
        <div className="form-grid">
          {longFields.map(([name, label, value, maxLength]) => (
            <div className="form-field" key={name}>
              <label htmlFor={`settings-${name}`}>{label}</label>
              <textarea className="textarea" id={`settings-${name}`} name={name} defaultValue={value} maxLength={maxLength} rows={name.startsWith("intro") ? 5 : 3} required />
              {state.fieldErrors?.[name] ? <span className="field-error">{state.fieldErrors[name]}</span> : null}
            </div>
          ))}
        </div>
      </section>
      {message ? <p className={`form-message ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p> : null}
      <div className="form-actions" style={{ justifyContent: "flex-start" }}>
        <button className="button button-primary" type="submit" disabled={pending}>
          {pending ? dictionary.common.saving : dictionary.common.save}
        </button>
      </div>
    </form>
  );
}
