import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  return <BillingClient initialCredits={userData?.credits || 0} />;
}