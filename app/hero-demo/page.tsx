import Hero from '../components/Hero';

// Standalone preview of the optimized 3D hero. Visit /hero-demo to view it,
// or drop <Hero /> into any page. Safe to delete this route once placed.
export default function HeroDemoPage() {
  return (
    <main className="bg-black">
      <Hero />
      <section
        id="features"
        className="flex min-h-screen items-center justify-center border-t border-zinc-900 text-zinc-600"
      >
        Page content continues here…
      </section>
    </main>
  );
}
