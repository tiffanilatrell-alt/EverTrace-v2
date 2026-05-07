import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="rounded-[2rem] bg-white p-6 shadow-soft sm:p-10">
        <p className="eyebrow">About Us</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          EverTrace helps families preserve stories that deserve to keep being found.
        </h1>
        <p className="mt-5 max-w-3xl leading-8 text-ink/68">
          We believe memorials should feel living, collaborative, and easy to share. EverTrace gives families a gentle way to create tribute pages, invite loved ones to add memories, and later connect those stories to a physical QR memorial plaque.
        </p>
        <p className="mt-4 max-w-3xl leading-8 text-ink/68">
          Start digitally, add memories over time, and preserve the tribute in the real world when the family is ready.
        </p>
        <Link
          to="/start"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-deep-purple px-6 font-semibold text-white transition hover:bg-rich-purple"
        >
          Start a Tribute
        </Link>
      </section>
    </main>
  );
}