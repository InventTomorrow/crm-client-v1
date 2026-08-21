import { describe, expect, it } from 'vitest';
import { buildWorkspaceTour } from './workspaceSteps';

const allowAll = () => true;

describe('buildWorkspaceTour', () => {
  it('stays short enough to sit through, whatever the business', () => {
    const verticals = ['RESTAURANT', 'ECOMMERCE', 'MARKETING_AGENCY'] as const;

    verticals.forEach((businessVertical) => {
      const tour = buildWorkspaceTour({ businessVertical, can: allowAll });
      expect(tour!.steps.length).toBeLessThan(15);
    });
  });

  it('never anchors a step to a list that is empty on day one', () => {
    const dataDependentAnchors = ['page-board', 'page-table', 'page-detail', 'kpi-grid'];
    const tour = buildWorkspaceTour({ businessVertical: 'RESTAURANT', can: allowAll });

    tour!.steps.forEach((step) => {
      dataDependentAnchors.forEach((anchor) => {
        expect(step.selector ?? '').not.toContain(anchor);
      });
    });
  });

  it('walks every part of the business settings page', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'ECOMMERCE', can: allowAll });
    const selectors = tour!.steps.map((step) => step.selector);

    ['business-category', 'business-description', 'business-qa', 'business-support'].forEach(
      (anchor) => expect(selectors).toContain(`[data-tour="${anchor}"]`),
    );
  });

  it('gives a restaurant its menu steps and no product or booking steps', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'RESTAURANT', can: allowAll });

    expect(tour?.tour).toBe('workspace-restaurant-v1');
    const contents = tour!.steps.map((step) => String(step.content));
    expect(contents.some((c) => c.includes('printed menu'))).toBe(true);
    expect(contents.some((c) => c.includes('Sizes, prices and stock'))).toBe(false);
    expect(contents.some((c) => c.includes('working hours'))).toBe(false);
  });

  it('gives an agency services, qualification and bookings instead of a catalogue', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'MARKETING_AGENCY', can: allowAll });

    expect(tour?.tour).toBe('workspace-agency-v1');
    const contents = tour!.steps.map((step) => String(step.content));
    expect(contents.some((c) => c.includes('services and packages'))).toBe(true);
    expect(contents.some((c) => c.includes('qualify a new enquiry'))).toBe(true);
    expect(contents.some((c) => c.includes('working hours'))).toBe(true);
    expect(contents.some((c) => c.includes('Brochures, portfolios'))).toBe(true);
    expect(contents.some((c) => c.includes('printed menu'))).toBe(false);
  });

  it('covers every page an agency workspace actually has', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'MARKETING_AGENCY', can: allowAll });
    const routes = new Set(
      tour!.steps.flatMap((step) => (step.nextRoute ? [step.nextRoute] : [])),
    );

    ['/services', '/qualification', '/bookings', '/resources', '/channels'].forEach((route) =>
      expect(routes).toContain(route),
    );
  });

  it('drops steps the role cannot open', () => {
    const withoutInbox = buildWorkspaceTour({
      businessVertical: 'ECOMMERCE',
      can: (permission) => permission !== 'conversations:view',
    });

    expect(
      withoutInbox!.steps.some((step) => String(step.content).includes('WhatsApp chats land here')),
    ).toBe(false);
  });

  it('navigates only where consecutive steps sit on different pages', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'ECOMMERCE', can: allowAll });
    const steps = tour!.steps;

    expect(steps[0].selector).toBe('[data-tour="sidebar-nav"]');
    expect(steps[0].nextRoute).toBeUndefined(); // step 2 is on the dashboard too

    const firstNavigation = steps.find((step) => step.nextRoute);
    expect(firstNavigation?.nextRoute).toBe('/settings/business');

    // The guide signs off on the page that actually switches the product on.
    const closing = steps.at(-1)!;
    expect(closing.selector).toBe('[data-tour="page-content"]');
    expect(closing.nextRoute).toBeUndefined();
  });

  it('has no tour before the workspace is known', () => {
    expect(buildWorkspaceTour({ businessVertical: undefined, can: allowAll })).toBeNull();
  });

  it('skips the guide for a role that cannot open any section', () => {
    const tour = buildWorkspaceTour({ businessVertical: 'RESTAURANT', can: () => false });

    expect(tour).toBeNull();
  });
});
