import Link from "next/link";

export function LoginForm() {
  return (
    <form className="w-full max-w-sm rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
      <Link href="/" className="text-lg font-semibold text-ink">
        Growfolo.io
      </Link>
      <h1 className="mt-8 text-2xl font-semibold text-ink">Admin login</h1>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Email
          <input className="rounded-md border border-ink/15 px-3 py-2" type="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Password
          <input className="rounded-md border border-ink/15 px-3 py-2" type="password" />
        </label>
      </div>
      <button className="mt-6 w-full rounded-md bg-ink px-4 py-2.5 font-medium text-white" type="submit">
        Sign in
      </button>
    </form>
  );
}

