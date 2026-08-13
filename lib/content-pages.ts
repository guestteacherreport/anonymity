import { supabase } from "@/lib/supabase";
import {
  type ContentPageContent,
  type ContentPageSlug,
  mergeContentPage,
} from "@/lib/content-page-schema";

export async function getPublishedContentPage(slug: ContentPageSlug): Promise<ContentPageContent> {
  try {
    const { data, error } = await supabase
      .from("content_pages")
      .select("published_content")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Published content page fetch failed:", error);
      return mergeContentPage(slug, null);
    }

    return mergeContentPage(slug, data?.published_content);
  } catch (error) {
    console.error("Published content page fetch failed:", error);
    return mergeContentPage(slug, null);
  }
}
