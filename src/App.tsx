import NavbarComponent from "./components/Navbar"
import HeroSection from './components/pages/HeroSection';
import { StorySection } from "./components/pages/StorySection";
import { ProjectsSection } from "./components/pages/ProjectsSection";
import Footer from "./components/Footer";

function App() {

  return (
    <>
      <div>
        <NavbarComponent />
        <HeroSection />
        <StorySection />
        <ProjectsSection />
        <Footer />
      </div>
    </>
  )
}

export default App