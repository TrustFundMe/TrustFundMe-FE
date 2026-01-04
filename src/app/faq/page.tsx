import { Faq2, Faq3 } from "@/components/Faq";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Faq" />
      <Faq3 />
      <Faq2 />
    </DanboxLayout>
  );
};

export default CausesPage;
