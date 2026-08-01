import Container from "../Container";
import Reveal from "../Reveal";
import { InboxDashboardMockup } from "../mockups";

export default function ManageInbox() {
  return (
    <section className="py-14 sm:py-20 md:py-24 bg-brand-mint">
      <Container>
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
          <div>
            <Reveal
              as="h2"
              className="text-4xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-brand-dark text-center lg:text-left whitespace-nowrap"
            >
              Manage Every Chat
              <br /> From One Inbox
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-brand-text text-[16px] leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                Stop switching between phones, tabs, and team members.
                AsaanRabta gives your team one shared workspace to view customer
                chats, reply faster, and take over from AI whenever needed.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-brand-text text-[16px] leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                Your AI handles repeated questions. Your team handles important
                conversations.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <InboxDashboardMockup />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
