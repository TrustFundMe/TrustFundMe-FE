import PageBanner from "@/components/PageBanner";
import { VolunteersPage } from "@/components/Volunter";
import DanboxLayout from "@/layout/DanboxLayout";

const CausesPage = () => {
  return (
    <DanboxLayout>
      <PageBanner pageName="Volunteer" pageTitle="Our Volunteer" />
      <VolunteersPage />
    </DanboxLayout>
  );
};

export default CausesPage;
