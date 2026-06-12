export type HalalEvidence = {
  source: string;
  label: string;
  href: string;
};

export type HalalAssurance = {
  badgeLabel: string;
  heading: string;
  summary: string;
  certificateUrl: string | null;
  certificateStatus: string;
  assurances: Array<{
    title: string;
    description: string;
  }>;
  evidence: HalalEvidence[];
};

export const HALAL_ASSURANCE: HalalAssurance = {
  badgeLabel: "Fully halal listed",
  heading: "Halal Dining With Clear Source Links",
  summary:
    "Pista House Wentworthville is publicly listed as a fully halal Hyderabadi restaurant. We keep this promise visible, practical and source-backed for families choosing where to dine.",
  certificateUrl: null,
  certificateStatus: "Formal certificate URL not publicly listed yet. Ask the team in-store for the latest supplier or zabihah details.",
  assurances: [
    {
      title: "No pork or alcohol focus",
      description: "Public halal dining guidance lists the venue as a fully halal option with no alcohol or pork service.",
    },
    {
      title: "Family and community confidence",
      description: "The restaurant is presented online as a halal Indian and Hyderabadi dining option for Wentworthville families.",
    },
    {
      title: "Supplier questions welcomed",
      description: "Guests who need specific hand-slaughter or supplier details should confirm with staff before ordering.",
    },
  ],
  evidence: [
    {
      source: "HalalHQ",
      label: "View halal listing",
      href: "https://halalhq.io/au/nsw/wentworthville/restaurants/pista-house",
    },
    {
      source: "Facebook",
      label: "View restaurant profile",
      href: "https://www.facebook.com/pistahousewest/",
    },
  ],
};
