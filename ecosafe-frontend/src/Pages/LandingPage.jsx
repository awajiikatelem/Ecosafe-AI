import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Story from "../Components/Story";
import Features from "../Components/Features";
import HowItWorks from "../Components/HowItWorks";
import Challenges from "../Components/Challenges";
import Community from "../Components/Community";
import Partners from "../Components/Partners";
import CTA from "../Components/CTA";
import Footer from "../Components/Footer";
import BackToTop from "../Components/BackToTop";

export default function Landing() {
  return (
    <div className="pt-20">
      <Navbar />
      <Hero />
      <Story />
      <Features />
      <HowItWorks />
      <Challenges />
      <Community />
      <Partners />
      <CTA />
      <Footer />
      <BackToTop />
    </div>
  );
}