import FoldedEnvelope from "@/components/intro/FoldedEnvelope";
import Hero from "@/components/sections/Hero";
import Quote from "@/components/sections/Quote";
import MemoryWall from "@/components/sections/MemoryWall";
import KusheAunsiBand from "@/components/sections/KusheAunsiBand";
import ShareMemory from "@/components/sections/ShareMemory";
import ThankYou from "@/components/sections/ThankYou";
import Nav from "@/components/ui/Nav";
import PaperGrainOverlay from "@/components/ui/PaperGrainOverlay";
import MusicToggle from "@/components/ui/MusicToggle";

export default function Page() {
  return (
    <main id="top" className="bg-cream text-ink">
      <Nav />
      <PaperGrainOverlay />
      <MusicToggle />
      <div className="buwa-snap">
        <FoldedEnvelope />
        <Hero />
        <Quote />
        <MemoryWall />
        <KusheAunsiBand />
        <ShareMemory />
        <ThankYou />
      </div>
    </main>
  );
}
