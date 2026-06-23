import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import GettingStarted from "./sections/GettingStarted";
import StopLosingLeads from "./sections/StopLosingLeads";
import FeaturesGrid from "./sections/FeaturesGrid";
import ManageInbox from "./sections/ManageInbox";
import FeatureDetail from "./sections/FeatureDetail";
import BusinessTypes from "./sections/BusinessTypes";
import Pricing from "./sections/Pricing";
import Values from "./sections/Values";
import FAQ from "./sections/FAQ";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased text-brand-dark">
      <Navbar />
      <Hero />
      <GettingStarted />
      <StopLosingLeads />
      <FeaturesGrid />
      <ManageInbox />
      <FeatureDetail />
      <BusinessTypes />
      <Pricing />
      <Values />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
