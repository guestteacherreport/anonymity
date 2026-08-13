import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  contentPageMetadata,
  isContentPageSlug,
  mergeContentPage,
  type ContentPageContent,
} from "@/lib/content-page-schema";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin" ? session : null;
}

function validateContent(slug: string, content: unknown): ContentPageContent | null {
  if (!isContentPageSlug(slug) || !content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }

  const merged = mergeContentPage(slug, content);
  const hasInvalidValue = Object.entries(content).some(
    ([key, value]) => !(key in merged) || typeof value !== "string" || value.length > 20000
  );
  const hasUnsafePath = Object.entries(merged).some(
    ([key, value]) => (key.endsWith("Href") || key.endsWith("Image")) && !value.startsWith("/")
  );

  return hasInvalidValue || hasUnsafePath ? null : merged;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, content, published_content, updated_at, published_at");

  if (error) {
    console.error("Content pages fetch failed:", error);
    return NextResponse.json({ error: "Unable to load content pages." }, { status: 500 });
  }

  const savedPages = new Map((data || []).map((page) => [page.slug, page]));
  const pages = Object.entries(contentPageMetadata).map(([slug, metadata]) => {
    const savedPage = savedPages.get(slug);
    return {
      ...metadata,
      slug,
      content: mergeContentPage(slug as keyof typeof contentPageMetadata, savedPage?.content),
      publishedContent: mergeContentPage(slug as keyof typeof contentPageMetadata, savedPage?.published_content),
      updatedAt: savedPage?.updated_at ?? null,
      publishedAt: savedPage?.published_at ?? null,
    };
  });

  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = validateContent(body.slug, body.content);
  if (!content) {
    return NextResponse.json({ error: "Invalid page content." }, { status: 400 });
  }

  const { data: existingPage, error: existingError } = await supabase
    .from("content_pages")
    .select("published_content, published_at")
    .eq("slug", body.slug)
    .maybeSingle();

  if (existingError) {
    console.error("Content page lookup failed:", existingError);
    return NextResponse.json({ error: "Unable to save page content." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("content_pages")
    .upsert(
      {
        slug: body.slug,
        content,
        published_content: existingPage?.published_content || {},
        published_at: existingPage?.published_at ?? null,
        updated_by: session.user.id ?? session.user.email,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "slug",
      }
    )
    .select("slug, content, published_content, updated_at, published_at")
    .single();

  if (error) {
    console.error("Content page save failed:", error);
    return NextResponse.json({ error: "Unable to save page content." }, { status: 500 });
  }

  return NextResponse.json({ page: data });
}

export async function PUT(request: Request) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const content = validateContent(body.slug, body.content);

  if (!content) {
    return NextResponse.json(
      { error: "Invalid page content." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("content_pages")
    .upsert(
      {
        slug: body.slug,
        content,
        published_content: content,
        updated_by: session.user.email ?? session.user.id,
        updated_at: now,
        published_at: now,
      },
      {
        onConflict: "slug",
      }
    )
    .select("slug, content, published_content, updated_at, published_at")
    .single();

  if (error) {
    console.error("Content page publish failed:", error);

    return NextResponse.json(
      { error: "Unable to publish page content." },
      { status: 500 }
    );
  }

  return NextResponse.json({ page: data });
}
