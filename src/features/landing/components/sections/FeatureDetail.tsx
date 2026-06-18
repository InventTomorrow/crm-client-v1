import Container from "../Container";
import Reveal from "../Reveal";
import {
  AIRepliesMockup,
  CRMTableMockup,
  BroadcastMockup,
  ImportLeadsMockup,
} from "../mockups";

const ITEMS = [
  {
    Mock: AIRepliesMockup,
    title: "Let AI Answer Repeated Questions Instantly",
    body: "Customers ask the same questions every day — prices, availability, delivery, bookings, timings, product details.",
    body2:
      "AsaanRabta answers using your business information, so customers get quick replies even when your team is busy.",
    link: "Connect WhatsApp",
  },
  {
    Mock: CRMTableMockup,
    title: "Track Every Lead In A Simple CRM",
    body: "No more lost chats. No more messy spreadsheets. No more forgotten follow-ups.",
    body2:
      "Every WhatsApp inquiry is saved and organized, so your team can see who is interested, who needs follow-up, and who is ready to buy.",
  },
  {
    Mock: BroadcastMockup,
    title: "Send Broadcast Campaigns On WhatsApp",
    body: "Promote offers, announce new arrivals, send reminders, and follow up with existing customers directly through WhatsApp.",
    body2:
      "Perfect for sales, Eid offers, Ramadan campaigns, product launches, appointment reminders, and customer updates.",
    link: "Send Your First Broadcast",
  },
  {
    Mock: ImportLeadsMockup,
    title: "Import Leads Through Excel",
    body: "Already have customer numbers or old leads?",
    body2:
      "Upload them through an Excel sheet and start managing them inside AsaanRabta. Bring your existing contacts into one system and follow up with them faster.",
  },
];

export default function FeatureDetail() {
  return (
    <section className="py-24 md:py-28 bg-white">
      <Container>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-16">
          {ITEMS.map(({ Mock, title, body, body2, link }, i) => (
            <Reveal key={i} delay={(i % 2) * 0.1}>
              <div className="group flex flex-col">
                <div className="mb-6 rounded-2xl transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
                  <Mock />
                </div>
                <h3 className="text-2xl md:text-[26px] font-bold text-brand-dark leading-tight">
                  {title}
                </h3>
                <p className="mt-4 text-brand-text text-[15px] leading-relaxed">
                  {body}
                </p>
                <p className="mt-3 text-brand-text text-[15px] leading-relaxed">
                  {body2}{" "}
                  {link && (
                    <a
                      href="#"
                      className="font-semibold text-brand-dark underline underline-offset-4 hover:text-brand-green transition-colors"
                    >
                      {link}
                    </a>
                  )}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
