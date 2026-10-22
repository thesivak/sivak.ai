// Section label: a numbered index followed by the section name, set in mono.
export default function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow-index">{index}</span>
      {children}
    </p>
  );
}
