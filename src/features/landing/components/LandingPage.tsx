import { fetchFeaturedPosts } from "@/features/blog/blog.api";
import { OfferDialog } from "@/features/offers/components/OfferDialog";
import { fetchActiveOffer } from "@/features/offers/services/offerService";
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
  const [plans, featuredPosts, offer] = await Promise.all([
    fetchLandingPlans(),
    fetchFeaturedPosts(4),
    fetchActiveOffer(),
  ]);

  return (
    <div className="min-h-screen bg-white antialiased text-brand-dark">
      <OfferBanner offer={offer} />
      <Navbar />
      <Hero offer={offer} />
      <GettingStarted />
      <StopLosingLeads />
      <FeaturesGrid />
      <ManageInbox />
      <FeatureDetail />
      <BusinessTypes />
      <Pricing plans={plans} offer={offer} />
      <Values />
      {/* <WhyAsaanRabta /> */}
      <LatestArticles posts={featuredPosts} />
      <FAQ />
      <FinalCTA />
      <Footer />
      {/* Opens itself 15s in, once a day — see useOfferDialog. */}
      <OfferDialog offer={offer} ctaHref="#pricing" />
    </div>
  );
}
