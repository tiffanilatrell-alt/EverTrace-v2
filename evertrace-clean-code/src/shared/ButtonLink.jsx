import { Link } from "react-router-dom";

export default function ButtonLink({ children, to, variant = "primary" }) {
  const styles =
    variant === "secondary"
      ? "border border-rich-purple/35 bg-white text-rich-purple hover:bg-stone"
      : "bg-deep-purple text-white hover:bg-rich-purple";

  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-center font-semibold transition sm:w-auto ${styles}`}
    >
      {children}
    </Link>
  );
}
