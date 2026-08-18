import { fetchFeaturedPosts } from "@/features/blog/blog.api";
import { fetchLandingPlans } from "../plans";
import BusinessTypes from "./sections/BusinessTypes";
import FAQ from "./sections/FAQ";
import FeatureDetail from "./sections/FeatureDetail";
import FeaturesGrid from "./sections/FeaturesGrid";
import FinalCTA from "./sections/FinalCTA";
import Footer from "./sections/Footer";
import GettingStarted from "./sections/GettingStarted";
import Hero from "./sections/Hero";
import LatestArticles from "./sections/LatestArticles";
import ManageInbox from "./sections/ManageInbox";
import Navbar from "./sections/Navbar";
import OfferBanner from "./sections/OfferBanner";
import Pricing from "./sections/Pricing";
import StopLosingLeads from "./sections/StopLosingLeads";
import Values from "./sections/Values";

/**
 * Server component: the plan catalogue is fetched here so pricing ships in
 * the SSR HTML rather than appearing after hydration.
 */
export async function LandingPage() {
  const [plans, featuredPosts] = await Promise.all([
    fetchLandingPlans(),
    fetchFeaturedPosts(4),
  ]);

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
      <Pricing plans={plans} />
      <Values />
      {/* <WhyAsaanRabta /> */}
      <LatestArticles posts={featuredPosts} />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
