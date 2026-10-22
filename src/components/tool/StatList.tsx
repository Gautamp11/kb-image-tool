type Stat = {
  label: string;
  value: string;
};

export function StatList({ items }: { items: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-[#f4efe6] px-3 py-2">
          <dt className="text-[#5c534c]">{item.label}</dt>
          <dd className="mt-1 font-medium break-all">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
