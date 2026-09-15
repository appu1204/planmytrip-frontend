// This produces a rough, transparent estimate purely from trip inputs
// (nights x travellers) so the form has something useful to show before
// your backend's real AI cost-estimate endpoint is wired in. Swap the
// body of `estimateTripCost` for a call to your endpoint whenever it's
// ready — the shape it returns is already what CostEstimateCard expects.
const RATE_PER_ADULT_NIGHT = 3600;
const RATE_PER_CHILD_NIGHT = 1800;
const RATE_ACTIVITIES_PER_TRAVELLER = 3000;
const RATE_TRANSPORT_PER_TRAVELLER = 2650;
const BUFFER_RATE = 0.1;

export function estimateTripCost({ nights, adults, children }) {
  const travellers = adults + children;
  if (!nights || !travellers) {
    return { stays: 0, activities: 0, transport: 0, buffer: 0, total: 0, travellers, nights };
  }

  const stays = nights * (adults * RATE_PER_ADULT_NIGHT + children * RATE_PER_CHILD_NIGHT);
  const activities = travellers * RATE_ACTIVITIES_PER_TRAVELLER;
  const transport = travellers * RATE_TRANSPORT_PER_TRAVELLER;
  const subtotal = stays + activities + transport;
  const buffer = subtotal * BUFFER_RATE;

  return {
    stays,
    activities,
    transport,
    buffer,
    total: subtotal + buffer,
    travellers,
    nights,
  };
}
