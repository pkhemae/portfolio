import Image from "next/image";
import { TracingBeamSection } from "@/components/TracingBeam";
import { Lamp } from "@/components/Lamp";
import { Projects } from "@/components/Projects";

export default function Home() {
  return (
    <div>
      <TracingBeamSection />
      <Lamp />
      <Projects />
    </div>
  );
}