import { Link } from "react-router";

export default function Logo() {
  return (
    <Link to="/" aria-label="Clackr home" className="group flex gap-1">
      {[..."clackr"].map((letter, i) => (
        <span
          key={i}
          style={{ transitionDelay: `${i * 40}ms` }}
          className={`keycap grid size-8 place-items-center rounded-md font-mono text-base font-bold group-hover:translate-y-[3px] group-hover:shadow-[0_1px_0_var(--key-edge)] ${
            i === 0 ? "text-accent" : "text-text"
          }`}
        >
          {letter}
        </span>
      ))}
    </Link>
  );
}
