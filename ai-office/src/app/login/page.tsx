import { redirect } from "next/navigation";
import { currentAuth } from "@/server/http";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if ((await currentAuth()).ok) redirect("/");
  return (
    <main className="ao-login">
      <div className="ao-glass ao-login-card">
        <div className="ao-brand">
          <b>yatpaketi</b>
          <span>AI Office</span>
        </div>
        <h1>Ofise giriş</h1>
        <LoginForm />
      </div>
    </main>
  );
}
