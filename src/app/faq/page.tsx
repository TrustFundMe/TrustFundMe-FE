import DanboxLayout from "@/layout/DanboxLayout";
import { Faq2, Faq3 } from "@/components/Faq";
import PageBanner from "@/components/PageBanner";

export default function FaqPage() {
  return (
    <DanboxLayout>
      <PageBanner pageName="Câu hỏi thường gặp" />
      <Faq3 />
      <Faq2 />
    </DanboxLayout>
  );
}
