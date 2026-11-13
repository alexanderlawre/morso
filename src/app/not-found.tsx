import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Link href="/dashboard" className="flex w-fit">
        <Wordmark className="h-10 w-auto" />
      </Link>
      <h1 className="mt-8 text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink shadow-brand"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
