import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "./HeaderClient";

export async function HeaderServer() {
  const supabase = await createClient();

  // Get the current user and their data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("credits, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    userData = data;
  }

  return (
    <header className="border-b glass backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-xl group"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden transition-transform group-hover:scale-110">
              <Image
                src="/apple-icon.png"
                alt="Nano Banana Lab"
                width={40}
                height={40}
                className="object-cover"
                priority
              />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Nano Banana Lab
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              ギャラリー
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium hover:text-primary"
            >
              履歴
            </Link>
            <Link
              href="/billing"
              className="text-sm font-medium hover:text-primary"
            >
              クレジット購入
            </Link>
          </nav>
        </div>

        <HeaderClient
          user={user}
          initialCredits={userData?.credits || 0}
          initialDisplayName={userData?.display_name}
          initialAvatarUrl={userData?.avatar_url}
        />
      </div>
    </header>
  );
}
