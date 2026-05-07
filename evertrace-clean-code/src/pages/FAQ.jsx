import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What is EverTrace?",
    answer:
      "EverTrace is a memorial platform that helps families create digital tribute pages for loved ones, with the option to connect those pages to a physical QR plaque.",
  },
  {
    question: "Do I need to buy a plaque to create a tribute?",
    answer: "No. You can create a tribute first. The plaque is an optional next step.",
  },
  {
    question: "Can family members add memories too?",
    answer:
      "Yes. EverTrace is designed to help families and loved ones contribute stories, photos, and reflections over time.",
  },
  {
    question: "Can I share a tribute page with relatives?",
    answer: "Yes. Each tribute can be shared by link so family and friends can visit and remember together.",
  },
  {
    question: "Are tribute pages public or private?",
    answer:
      "This depends on the settings you choose. Some families want a public page, while others prefer something more private.",
  },
  {
    question: "What does the QR plaque do?",
    answer:
      "The plaque links a physical memorial item to a living digital tribute page that people can scan and visit.",
  },
  {
    question: "Can I update a tribute after publishing it?",
    answer: "Yes. Tribute pages are meant to grow over time.",
  },
  {
    question: "Can I include photos?",
    answer: "Yes. Photos are an important part of preserving a life and story.",
  },
  {
    question: "Who is EverTrace for?",
    answer:
      "EverTrace is for anyone who wants to preserve the memory of a loved one in a more lasting, collaborative, and meaningful way.",
  },
];

export default function FAQ() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="text-center">
        <p className="eyebrow">FAQs</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Questions families often ask</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-8 text-ink/65">
          A simple guide to creating, sharing, and preserving a tribute with EverTrace.
        </p>
      </section>

      <section className="mt-10 space-y-3">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-2xl border border-rich-purple/10 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-deep-purple">{faq.question}</h2>
            <p className="mt-3 leading-7 text-ink/68">{faq.answer}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 rounded-3xl bg-light-purple p-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Ready to begin?</h2>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-ink/65">
          Start with a few words and photos. You can invite family and preserve the tribute with a plaque later.
        </p>
        <Link
          to="/start"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-deep-purple px-6 font-semibold text-white transition hover:bg-rich-purple"
        >
          Start a Tribute
        </Link>
      </div>
    </main>
  );
}