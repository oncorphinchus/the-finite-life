import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  // Create redirect URL without auth params
  const redirectTo = new URL(next, origin);

  if (code) {
    // OAuth flow - exchange code for session
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  if (token_hash && type) {
    // Magic link / Email OTP flow - verify token
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink",
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  // Auth error - redirect to login with error
  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "Authentication failed. Please try again.");
  return NextResponse.redirect(errorUrl);
}
