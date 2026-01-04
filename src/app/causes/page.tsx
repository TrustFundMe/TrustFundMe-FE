import { CausesTab } from "@/components/Causes";
import { Cta1 } from "@/components/Cta";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Our Causes" />
      <CausesTab />
      <Cta1 />
    </DanboxLayout>
  );
};

export default CausesPage;
