import { getContactSettings } from "@/lib/firestoreService";
import { contact as staticContact } from "@/app/resources/content";
import { ContactForm } from "./ContactForm";

export const revalidate = 60;

export default async function ContactPage() {
  let title = staticContact.title;
  let description = staticContact.description;

  try {
    const data = await Promise.race([
      getContactSettings(),
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);
    if (data?.title) title = data.title;
    if (data?.description) description = data.description;
  } catch {}

  return <ContactForm title={title} description={description} />;
}