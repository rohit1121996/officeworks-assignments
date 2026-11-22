import { Link } from "react-router-dom";

type BreadcrumbLink = { label: string; to: string };

export function Breadcrumbs({
  links,
  current,
}: {
  links: BreadcrumbLink[];
  current: string;
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {links.map(({ label, to }) => (
          <li key={to}>
            <Link to={to}>{label}</Link>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}
