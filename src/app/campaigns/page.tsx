import type { Metadata } from "next";
import CampaignBanner from "@/components/campaign/CampaignBanner";
import { CampaignCategoriesSection } from "@/components/campaign/CampaignCategoriesSection";
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
          heading="Nơi trao gửi yêu thương"
          subheading="Gửi gắm yêu thương và lan tỏa những điều tốt đẹp"
          ctaLabel="Tạo chiến dịch"
          ctaHref="/new-campaign-test"
        />
        <CampaignCategoriesSection />
      </div>
    </DanboxLayout>
  );
};

export default CampaignsPage;
