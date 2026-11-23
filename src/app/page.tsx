import { About } from "@/components/About";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MarqueeBand } from "@/components/MarqueeBand";
import { Navbar } from "@/components/Navbar";
import { ProofStats } from "@/components/ProofStats";
import { ScrollChoreography } from "@/components/ScrollChoreography";
import { SelectedWork } from "@/components/SelectedWork";
import { Services } from "@/components/Services";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ProofStats />
        <About />
        <MarqueeBand />
        <SelectedWork />
        <Services />
        <ContactSection />
      </main>
      <Footer />
      <ScrollChoreography />
    </>
  );
}
