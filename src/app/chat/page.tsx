import { getPerson } from "@/lib/firestoreService";
import { person as staticPerson } from "@/app/resources/content";
import { Chat } from "./Chat";

export const revalidate = 60;

async function getAvatarUrl(): Promise<string> {
  try {
    const p = await Promise.race([
      getPerson(),
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);
    return p?.avatar || staticPerson.avatar;
  } catch {
    return staticPerson.avatar;
  }
}

export default async function ChatPage() {
  const avatarUrl = await getAvatarUrl();
  return <Chat avatarUrl={avatarUrl} />;
}
