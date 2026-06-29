import Container from "../Container";
import { PrimaryCta } from "../LandingCta";
import Reveal from "../Reveal";
import { StopLosingLeadsPhone } from "../mockups";

export default function StopLosingLeads() {
  return (
    <section className="py-14 sm:py-20 md:py-24 bg-brand-mint">
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Reveal
              as="h2"
              className="text-4xl text-center lg:text-left md:text-5xl lg:text-[56px] font-bold leading-[1.05] tracking-tight text-brand-dark"
            >
              Stop Losing Sales
              <br /> Inside WhatsApp
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 text-brand-text text-[16px] leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <p>
                  Your customers are messaging you right now asking for
                  &quot;Price?&quot;, &quot;Stock?&quot;, and
                  &quot;Delivery?&quot;.
                </p>
                <p>
                  But if you take 30 minutes to reply, they have already bought
                  it from someone else.
                </p>
                <p>
                  <span className="font-semibold text-brand-dark">
                    AsaanRabta makes sure you are always the first to reply.
                  </span>{" "}
                  Our AI agent handles the hustle 24/7, answering every inquiry
                  instantly so you can close the sale before the lead goes cold.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex justify-center lg:justify-start">
                <PrimaryCta className="h-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
                  Start Closing More Sales
                </PrimaryCta>
              </div>
            </Reveal>
          </div>
          <Reveal>
            <StopLosingLeadsPhone />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
