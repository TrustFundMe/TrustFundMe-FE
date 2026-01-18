import { CampaignCategoriesSection } from "@/components/campaign/CampaignCategoriesSection";
import CampaignBanner from "@/components/campaign/CampaignBanner";
import CampaignHighlightSlider from "@/components/campaign/CampaignHighlightSlider";
import DanboxLayout from "@/layout/DanboxLayout";

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
