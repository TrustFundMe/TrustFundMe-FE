import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All campaigns",
  description: "Browse and search all fundraising campaigns.",
};

export default function CampaignsListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
