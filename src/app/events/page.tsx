import { EventPage } from "@/components/Event";
import PageBanner from "@/components/PageBanner";
import DanboxLayout from "@/layout/DanboxLayout";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Events" pageTitle="Upcoming Events" />
      <EventPage />
    </DanboxLayout>
  );
};

export default CausesPage;
