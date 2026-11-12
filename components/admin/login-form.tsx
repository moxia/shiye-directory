"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/[locale]/admin/actions";
import type { Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function LoginForm({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const [state, action, pending] = useActionState(loginAction, initialState);
  const message =
    state.message === "setupRequired"
      ? dictionary.admin.setupRequired
      : state.message === "loginError"
        ? dictionary.admin.loginError
        : state.message
          ? dictionary.errors.generic
          : null;

  return (
    <form action={action} className="login-form">
      <input type="hidden" name="locale" value={locale} />
      <div className="form-field">
        <label htmlFor="email">{dictionary.admin.email}</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
      </div>
      <div className="form-field">
        <label htmlFor="password">{dictionary.admin.password}</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
      </div>
      {message ? <p className="form-message is-error" role="alert">{message}</p> : null}
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? dictionary.admin.loggingIn : dictionary.admin.login}
      </button>
    </form>
  );
}
