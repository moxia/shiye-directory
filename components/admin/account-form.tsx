"use client";

import { KeyRound } from "lucide-react";
import { useActionState } from "react";
import { changePasswordAction } from "@/app/[locale]/admin/actions";
import { resolveActionMessage } from "@/components/admin/action-message";
import type { Dictionary } from "@/lib/i18n";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function AccountForm({ dictionary }: { dictionary: Dictionary }) {
  const [state, action, pending] = useActionState(changePasswordAction, initialState);
  const message = resolveActionMessage(dictionary, state);

  return (
    <form action={action} className="settings-form">
      <section className="settings-section">
        <h2>{dictionary.admin.changePassword}</h2>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="new-password">{dictionary.admin.newPassword}</label>
            <input className="input" id="new-password" name="password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
            {state.fieldErrors?.password ? <span className="field-error">{dictionary.admin.passwordLength}</span> : null}
          </div>
          <div className="form-field">
            <label htmlFor="confirm-password">{dictionary.admin.confirmPassword}</label>
            <input className="input" id="confirm-password" name="confirmPassword" type="password" minLength={8} maxLength={72} autoComplete="new-password" required />
            {state.fieldErrors?.confirmPassword ? <span className="field-error">{dictionary.admin.passwordMismatch}</span> : null}
          </div>
        </div>
      </section>
      {message ? <p className={`form-message ${message.error ? "is-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p> : null}
      <div className="form-actions" style={{ justifyContent: "flex-start" }}>
        <button className="button button-primary" type="submit" disabled={pending}>
          <KeyRound aria-hidden="true" />
          {pending ? dictionary.common.saving : dictionary.admin.changePassword}
        </button>
      </div>
    </form>
  );
}
