interface SiteHeaderProps {
  title: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b">
      <div className="flex w-full items-center px-4 lg:px-6">
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  );
}
