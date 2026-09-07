import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, adminSessionToken, isValidAdminPassword } from "@/lib/admin-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    const suffix = next ? `&next=${encodeURIComponent(next)}` : "";

    if (!isValidAdminPassword(password)) {
      redirect(`/admin/login?error=1${suffix}`);
    }
    const token = await adminSessionToken();
    if (!token) {
      redirect(`/admin/login?error=config${suffix}`);
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirect(next || "/admin/blog");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-xl font-black text-foreground">Admin login</h1>
      {error === "1" && <p className="text-sm text-danger">Wrong password.</p>}
      {error === "config" && (
        <p className="text-sm text-danger">ADMIN_PASSWORD isn&apos;t configured on the server.</p>
      )}
      <form action={login} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-saffron"
        />
        <button
          type="submit"
          className="rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
