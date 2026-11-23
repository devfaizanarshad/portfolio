interface SectionHeadingProps {
  index: string;
  kicker: string;
  title: string;
  titleId: string;
  lede?: string;
}

export function SectionHeading({ index, kicker, title, titleId, lede }: SectionHeadingProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">
        <p className="mono-label" data-reveal>
          <span className="text-signal">{index}</span>
          <span className="mx-2 text-bone-faint">{"//"}</span>
          {kicker}
        </p>
        <h2 id={titleId} className="h2 mt-5 max-w-[22ch]" data-reveal>
          {title}
        </h2>
      </div>
      {lede && (
        <p className="lede lg:col-span-5 lg:pb-1" data-reveal>
          {lede}
        </p>
      )}
    </div>
  );
}
