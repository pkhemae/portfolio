import NavbarComponent from "./components/Navbar"
import HeroSection from './components/pages/HeroSection';
import { StorySection } from "./components/pages/StorySection";
import { ProjectsSection } from "./components/pages/ProjectsSection";

function App() {

  return (
    <>
      <div>
        <NavbarComponent />
        <HeroSection />
        <StorySection />
        <ProjectsSection />
      </div>
    </>
  )
}

export default App