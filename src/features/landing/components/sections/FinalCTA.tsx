import { Button } from "@/shared/ui/Button";
import Container from "../Container";
import Reveal from "../Reveal";
import { CTAFloatingPhone } from "../mockups";

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <Container>
        <Reveal>
          <div className="relative rounded-[28px] bg-brand-dark overflow-hidden p-10 md:p-16">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold leading-[1.1] tracking-tight text-white">
                  Ready To Manage
                  <br /> WhatsApp Leads Smarter?
                </h2>
                <p className="mt-6 text-white/70 text-[15px] md:text-base leading-relaxed max-w-md">
                  Your next customer may already be waiting in your WhatsApp
                  inbox. Reply faster, manage leads better, and convert more
                  conversations into customers.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button className="h-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
                    Get Started Today
                  </Button>
                  <Button className="h-auto rounded-full border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50">
                    See How It Works
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative h-[440px]">
                <CTAFloatingPhone />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
