import Image from "next/image";
import { TracingBeamSection } from "@/components/TracingBeam";
import { Lamp } from "@/components/Lamp";
import { Projects } from "@/components/Projects";
import { SpotlightPreview } from "@/components/SpotlightPreview";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <SpotlightPreview />
      <TracingBeamSection />
      <Lamp />
      <Projects />
      <Footer />
    </div>
  );
}