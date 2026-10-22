export function DocPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-5 leading-7 text-[#3f3833] [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight">
        {children}
      </div>
    </main>
  );
}
