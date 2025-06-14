import { createClient } from "@/utils/supabase/client";

export async function getGroupById(groupId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("group")
    .select("id, name, slug")
    .eq("id", groupId)
    .single();

  if (error) throw new Error(error.message);
  console.log("Get group data by ID: ", data);
  return data;
}
