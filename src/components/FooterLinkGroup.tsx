interface FooterLink {
  label: string;
  href: string;
}

export function FooterLinkGroup({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200 dark:text-[#94A3B8]">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm text-neutral-400 dark:text-[#64748B]">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="transition hover:text-white dark:hover:text-[#E2E8F0]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
