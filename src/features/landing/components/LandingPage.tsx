import BusinessTypes from "./sections/BusinessTypes";
import FAQ from "./sections/FAQ";
import FeatureDetail from "./sections/FeatureDetail";
import FeaturesGrid from "./sections/FeaturesGrid";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";
import GettingStarted from "./sections/GettingStarted";
import Hero from "./sections/Hero";
import ManageInbox from "./sections/ManageInbox";
import Navbar from "./sections/Navbar";
import OfferBanner from "./sections/OfferBanner";
import Pricing from "./sections/Pricing";
import StopLosingLeads from "./sections/StopLosingLeads";
import Values from "./sections/Values";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased text-brand-dark">
      <OfferBanner />
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
