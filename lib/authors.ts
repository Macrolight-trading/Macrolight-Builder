export interface Author {
  key: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  /** Tailwind bg-* class for the initials avatar */
  color: string;
  /** Optional path to a headshot under /public, e.g. "/team/bradley.jpg" */
  photo?: string;
}

export const authors: Record<string, Author> = {
  bradley: {
    key: "bradley",
    name: "Bradley Bayley",
    role: "Co-Founder, Macrolight Builder",
    bio: "Full-stack engineer focused on page speed and conversion. Bradley leads the build side of every Macrolight project — the code, hosting, analytics, and the lead-capture systems that make a site actually pay for itself.",
    initials: "BB",
    color: "bg-violet-600",
    // photo: "/team/bradley.jpg",
  },
  nick: {
    key: "nick",
    name: "Nick Ottoy",
    role: "Co-Founder, Macrolight Builder",
    bio: "Strategy and client side. Nick spends most of his time talking to local business owners about what's actually keeping the phone from ringing — then turns that into the positioning, content, and growth plan behind each build.",
    initials: "NO",
    color: "bg-cyan-600",
    // photo: "/team/nick.jpg",
  },
};

export function getAuthor(key: string): Author | undefined {
  return authors[key];
}
