import { Link } from "react-router-dom";

const articles = [
  {
    title: "How to write a tribute when words feel hard",
    body: "Start with one detail: a habit, phrase, recipe, or small kindness. A tribute does not have to be complete to be meaningful.",
  },
  {
    title: "Why shared memories matter",
    body: "Family members often remember different parts of a life. A collaborative tribute lets those pieces gather in one place.",
  },
  {
    title: "What a QR memorial plaque can preserve",
    body: "A plaque can connect a gravesite, urn space, memorial garden, or keepsake to the stories and photos people continue to add.",
  },
];

export default function Resources() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="text-center">
        <p className="eyebrow">Related Articles</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Resources for remembering well</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-ink/65">
          Gentle guidance for creating tributes, gathering family stories, and preserving memories over time.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {articles.map((article) => (
          <article key={article.title} className="rounded-2xl border border-rich-purple/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-deep-purple">{article.title}</h2>
            <p className="mt-3 leading-7 text-ink/65">{article.body}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 text-center">
        <Link to="/faq" className="font-semibold text-deep-purple transition hover:text-rich-purple">
          Read frequently asked questions
        </Link>
      </div>
    </main>
  );
}