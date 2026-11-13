import { redirect } from "next/navigation";
import { OfficeApp } from "@/components/OfficeApp";
import { currentAuth } from "@/server/http";
import { officeState } from "@/server/state";

export const dynamic = "force-dynamic";

export default async function Page() {
  const auth = await currentAuth();
  if (!auth.ok) {
    if (auth.reason === "login") redirect("/login");
    return (
      <main className="ao-login">
        <div className="ao-glass ao-login-card">
          <h1>Ofis kilitli</h1>
          <p>
            Parola tanımlı olmadığı için AI Office yalnızca <code>localhost</code> üzerinden açılır. Uzaktan erişim için <code>AI_OFFICE_PASSWORD</code> ve <code>AI_OFFICE_SESSION_SECRET</code> değişkenlerini tanımlayın.
          </p>
        </div>
      </main>
    );
  }
  return <OfficeApp initial={officeState()} />;
}
