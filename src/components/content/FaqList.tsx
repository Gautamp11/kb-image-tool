export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-[#e4d8c8] rounded-3xl border border-[#e4d8c8] bg-[#fffaf3]">
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-3">
          <summary className="cursor-pointer list-none py-2 font-medium marker:content-none">
            <span className="flex items-center justify-between gap-3">
              {item.question}
              <span aria-hidden="true" className="text-[#c45c26] group-open:hidden">
                +
              </span>
              <span aria-hidden="true" className="hidden text-[#c45c26] group-open:inline">
                −
              </span>
            </span>
          </summary>
          <p className="pb-3 pr-8 text-[#5c534c] leading-7">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
