import type { Metadata } from "next";
import { CampaignCategoriesSection } from "@/components/campaign/CampaignCategoriesSection";
import CampaignBanner from "@/components/campaign/CampaignBanner";
import { VolunteerDoubleCta } from "@/components/campaign/VolunteerDoubleCta";
import DanboxLayout from "@/layout/DanboxLayout";

export const metadata: Metadata = {
  title: "Campaigns",
  description:
    "Explore and support fundraising campaigns. Help bring meaningful campaigns to life.",
};

const CampaignsPage = () => {
  return (
    <DanboxLayout header={4}>
      <div className="font-dm-sans">
        <CampaignBanner
          heading="Sưởi ấm lòng người"
          subheading="Giúp đỡ hôm nay để cộng đồng phát triển mạnh mẽ hơn vào ngày mai"
          ctaLabel="Tạo chiến dịch"
          ctaHref="/campaign-creation"
        />
        <VolunteerDoubleCta />
        <CampaignCategoriesSection />
      </div>
    </DanboxLayout>
  );
};

export default CampaignsPage;
