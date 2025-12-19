import Image from "next/image";
import { TracingBeamSection } from "@/components/TracingBeam";
import { Lamp } from "@/components/Lamp";

export default function Home() {
  return (
    <div>
      <TracingBeamSection />
      <Lamp />
    </div>
  );
}