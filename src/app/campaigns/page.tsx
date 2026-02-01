import type { Metadata } from "next";
import { CampaignCategoriesSection } from "@/components/campaign/CampaignCategoriesSection";
import CampaignBanner from "@/components/campaign/CampaignBanner";
import CampaignHighlightSlider from "@/components/campaign/CampaignHighlightSlider";
import DanboxLayout from "@/layout/DanboxLayout";

export const metadata: Metadata = {
  title: "Campaigns",
  description:
    "Explore and support fundraising campaigns. Help bring meaningful campaigns to life.",
};

const CampaignsPage = () => {
  return (
    <DanboxLayout>
      <div className="font-dm-sans">
        <CampaignBanner
          heading="Help Bring Meaningful Campaigns to Life"
          subheading="Helping today so communities can thrive tomorrow"
          ctaLabel="Start a Campaign"
          ctaHref="#campaigns"
        />
        <CampaignHighlightSlider />
        <CampaignCategoriesSection />
      </div>
    </DanboxLayout>
  );
};

export default CampaignsPage;
