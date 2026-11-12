import type { Dictionary } from "@/lib/i18n";
import type { ActionState } from "@/lib/types";

export function resolveActionMessage(
  dictionary: Dictionary,
  state: ActionState<unknown>
): { text: string; error: boolean } | null {
  if (!state.message) return null;
  const textByMessage: Record<string, string> = {
    saved: dictionary.admin.saved,
    deleted: dictionary.admin.deleted,
    reordered: dictionary.admin.reordered,
    passwordUpdated: dictionary.admin.passwordUpdated,
    categoryHasSites: dictionary.admin.categoryHasSites,
    duplicateSlug: dictionary.admin.duplicateSlug,
    duplicateUrl: dictionary.admin.duplicateUrl,
    invalidFile: dictionary.admin.invalidFile,
    importError: dictionary.admin.importError,
    sessionExpired: dictionary.admin.sessionExpired,
    loginError: dictionary.admin.loginError,
    setupRequired: dictionary.admin.setupRequired
  };

  if (state.message === "invalid") {
    const fieldMessage = state.fieldErrors
      ? Object.values(state.fieldErrors).find(Boolean)
      : undefined;
    return { text: fieldMessage ?? dictionary.errors.generic, error: true };
  }

  return {
    text: textByMessage[state.message] ?? dictionary.errors.generic,
    error: !state.ok
  };
}
