import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isTrackId } from "@/lib/catalog";
import {
  inferSectionForLegacyPath,
  isNavSectionSlug,
  peelSectionPrefix,
  withHandbookSection,
} from "@/lib/i18n/sectionPaths";
import { isLocale } from "@/lib/i18n/locales";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (!locale || !isLocale(locale)) {
    return NextResponse.next();
  }

  const rest = `/${segments.slice(1).join("/")}` || "/";
  const peeled = peelSectionPrefix(rest);

  if (peeled.section && peeled.rest !== "/" && peeled.rest !== "") {
    const inner = peeled.rest.slice(1).split("/").filter(Boolean);
    const track = inner[0];
    if (track && isTrackId(track)) {
      const rewritePath = `/${[locale, ...inner].join("/")}`;
      return NextResponse.rewrite(new URL(rewritePath, request.url));
    }
  }

  if (peeled.section) {
    return NextResponse.next();
  }

  if (segments.length === 1) {
    return NextResponse.next();
  }

  const second = segments[1];
  if (second === "instructions") {
    return NextResponse.next();
  }

  if (isNavSectionSlug(second)) {
    return NextResponse.next();
  }

  if (!isTrackId(second)) {
    return NextResponse.next();
  }

  const section = inferSectionForLegacyPath(pathname);
  if (!section) {
    return NextResponse.next();
  }

  const canonical = withHandbookSection(pathname, section);
  if (canonical === pathname) {
    return NextResponse.next();
  }

  const target = new URL(canonical, request.url);
  target.hash = request.nextUrl.hash;
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/en((?!/_next).*)", "/ru((?!/_next).*)"],
};
