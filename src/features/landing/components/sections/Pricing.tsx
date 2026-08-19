"use client";

import { motion } from "framer-motion";
import { OfferCountdown } from "@/features/offers/components/OfferCountdown";
import type { ActiveOffer } from "@/features/offers/types";
import type { Plan } from "../../plans";
import Container from "../Container";
import { CheckIcon, ZapIcon } from "../icons";
import { PlanCta } from "../LandingCta";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

/**
 * Plans come from the public catalogue, fetched by the server component that
 * renders this one, so the prices are in the SSR HTML for crawlers.
 */
export default function Pricing({
  plans,
  offer,
}: {
  plans: Plan[];
  offer: ActiveOffer | null;
}) {
  // Nothing published yet — drop the section rather than show an empty grid.
  if (plans.length === 0) return null;

  // Two plans sit side by side; three or more need a third column.
  const columns =
    plans.length >= 3
      ? "md:grid-cols-3 max-w-[1180px]"
      : "md:grid-cols-2 max-w-[860px]";

  return (
    <section
      id="pricing"
      className="scroll-mt-28 py-16 sm:py-24 md:py-28 bg-brand-mint-3"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Simple Pricing That
              <br /> Grows With You
            </>
          }
          subtitle="Start with one branch and move up to more workspaces and broadcasts when your business is ready. No hidden fees."
        />

        {/* The decision point — restate the deadline right above the grid so
            nobody has to scroll back to the strip to see how long is left. */}
        {offer && (
          <Reveal>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-2xl border border-brand-amber/25 bg-brand-amber/10 px-5 py-3 text-center text-brand-amber-dark sm:mt-10">
              <ZapIcon className="hidden h-4 w-4 shrink-0 sm:block" />
              <span className="text-[15px] font-semibold">
                {offer.discountPercent}% off every plan
              </span>
              <span className="text-brand-amber-dark/30">|</span>
              <span className="text-[13px] font-medium">Ends in</span>
              <OfferCountdown endsAt={offer.endsAt} className="text-[15px]" />
            </div>
          </Reveal>
        )}

        <div
          className={`mt-12 sm:mt-14 grid gap-6 ${columns} mx-auto items-stretch`}
        >
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.1}>
              <motion.div
                whileHover={plan.comingSoon ? undefined : { y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative h-full flex flex-col rounded-3xl p-7 sm:p-8 overflow-hidden ${
                  plan.featured
                    ? "bg-brand-dark text-white shadow-dashboard"
                    : "bg-white text-brand-dark border border-gray-100 shadow-card"
                }`}
              >
                {/* Coming-soon overlay marker */}
                {plan.comingSoon && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <span className="rounded-full bg-white/95 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-brand-dark shadow-lg ring-1 ring-black/5">
                      Coming Soon
                    </span>
                  </div>
                )}

                {plan.featured && !plan.comingSoon && (
                  <span className="absolute top-6 right-6 rounded-full bg-brand-green px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                )}

                <div
                  className={
                    plan.comingSoon
                      ? "blur-[3px] opacity-80 pointer-events-none select-none"
                      : "contents"
                  }
                >
                  <h3
                    className={`text-lg font-bold ${plan.featured ? "text-white" : "text-brand-dark"}`}
                  >
                    {plan.name}
                  </h3>
                  {/* <p
                    className={`mt-2 text-[15px] leading-relaxed ${plan.featured ? "text-white/70" : "text-brand-text"}`}
                  >
                    {plan.tagline}
                  </p> */}

                  {plan.discountPercentage && (
                    <div className="mt-6 flex items-center gap-2">
                      {plan.originalPrice && (
                        <span
                          className={`text-xl line-through font-bold ${plan.featured ? "text-white/50" : "text-brand-text-soft"}`}
                        >
                          Rs {plan.originalPrice}
                        </span>
                      )}
                      <span className="rounded-full bg-brand-amber px-2.5 py-0.5 text-[12px] font-semibold text-white">
                        {plan.discountPercentage}% OFF
                      </span>
                      {plan.offerEndsAt ? (
                        <OfferCountdown
                          endsAt={plan.offerEndsAt}
                          className="text-brand-amber-dark"
                        />
                      ) : (
                        <span className="text-[12px] font-medium text-brand-amber-dark">
                          {plan.offerCountdown}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-1 ${plan.discountPercentage ? "mt-1.5" : "mt-6"}`}
                  >
                    <span
                      className={`text-[15px] font-medium ${plan.featured ? "text-white/70" : "text-brand-text"}`}
                    >
                      Rs
                    </span>
                    <span className="text-[2.75rem] font-bold leading-none tracking-tight">
                      {plan.price}
                    </span>
                    <span
                      className={`mb-1 text-[15px] ${plan.featured ? "text-white/60" : "text-brand-text"}`}
                    >
                      {plan.period}
                    </span>
                  </div>

                  {plan.tagline && (
                    <p className="mt-2.5 text-[13px] font-medium text-brand-green">
                      {plan.tagline}
                    </p>
                  )}

                  <div className="my-7 h-px w-full bg-current opacity-10" />

                  <ul className="flex-1 space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.featured
                              ? "bg-brand-green text-white"
                              : "bg-brand-leaf-2 text-brand-dark"
                          }`}
                        >
                          <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span
                          className={`text-[15px] leading-snug ${plan.featured ? "text-white/90" : "text-brand-text"}`}
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <PlanCta
                      planId={plan.id}
                      className={`w-full justify-center h-auto rounded-full px-7 py-3.5 text-base font-semibold transition-all hover:-translate-y-0.5 ${
                        plan.featured
                          ? "bg-white text-brand-dark hover:bg-gray-100 hover:text-brand-dark"
                          : "bg-brand-green text-white shadow-cta hover:bg-brand-green-hover hover:shadow-cta-hover"
                      }`}
                    >
                      {plan.cta}
                    </PlanCta>
                    {!plan.featured && (
                      <>
                        <p className="mt-3 text-center text-[13px] text-brand-text-soft">
                          No credit card required.
                        </p>
                        <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-brand-text">
                          <ZapIcon className="h-3.5 w-3.5 text-brand-green" />
                          100% Secure WhatsApp Connection
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
