import NavbarComponent from "./components/Navbar"
import HeroSection from './components/pages/HeroSection';
import { StorySection } from "./components/pages/StorySection";

function App() {

  return (
    <>
      <div>
        <NavbarComponent />
        <HeroSection />
        <StorySection />
      </div>
    </>
  )
}

export default App