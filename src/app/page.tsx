export default function HomePage() {
  return (
    <main className="container-prose py-24">
      <h1 className="text-balance">
        Right Way Phangan
      </h1>
      <p className="mt-6 text-lg text-forest-500/80 max-w-prose">
        Premium real estate on Koh Phangan. Land, villas, and houses — curated,
        verified, transparent.
      </p>
      <p className="mt-12 text-sm text-forest-500/60">
        MVP scaffold · {new Date().toISOString().slice(0, 10)}
      </p>
    </main>
  );
}
