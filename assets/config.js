// Single source of truth for affiliate links.
// Attribution is handled by the promo code entered at sign-up, so we send visitors
// straight to the KOHO main site. If an Impact tracking URL is later provisioned,
// swap it in here.
window.BREMO_CONFIG = {
  koho: {
    affiliateUrl: "https://www.koho.ca/",
    promoCode: "BREMO2026",
    bonusAmount: "$20",
    offerName: "KOHO $20 Sign-Up Bonus"
  }
};
