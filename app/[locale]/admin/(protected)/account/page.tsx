import { notFound } from "next/navigation";
import { AccountForm } from "@/components/admin/account-form";
import { isLocale, type Locale } from "@/lib/config";
import { getDictionary } from "@/lib/i18n";
import { getAdminSession } from "@/lib/supabase/auth";

export default async function AdminAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value;
  const dictionary = getDictionary(locale);
  const session = await getAdminSession();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>{dictionary.admin.accountTitle}</h1>
          <p>{dictionary.admin.accountIntro}</p>
        </div>
      </header>
      <div className="account-line">
        <span>{dictionary.admin.email}</span>
        <strong>{session?.email}</strong>
      </div>
      <AccountForm dictionary={dictionary} />
    </>
  );
}
