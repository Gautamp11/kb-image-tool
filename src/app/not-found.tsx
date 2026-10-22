import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-[#5c534c]">
        That URL is not part of this site. Return to the compressor to keep
        working locally.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-[#c45c26] px-6 font-semibold text-[#fffaf3]"
      >
        Back to the tool
      </Link>
    </main>
  );
}
