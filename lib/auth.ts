// lib/auth.ts

import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

type DbAuthUser = {
  id: number | string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  provider: string | null;
  providerAccountId: string | null;
};

const AUTH_USER_COLUMNS = "id, email, full_name, role, provider, providerAccountId";

// user_oauth_accounts is created by a migration; until it has been applied
// sign-in keeps working from the legacy users.provider columns.
function isMissingTable(error: { code?: string } | null) {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

async function findUserByProviderAccount(
  provider: string,
  providerAccountId: string
): Promise<DbAuthUser | null> {
  const { data: link, error: linkError } = await supabase
    .from("user_oauth_accounts")
    .select("user_id")
    .eq("provider", provider)
    .eq("provider_account_id", providerAccountId)
    .maybeSingle();

  if (linkError && !isMissingTable(linkError)) {
    throw new Error(linkError.message);
  }

  if (link) {
    const { data, error } = await supabase
      .from("users")
      .select(AUTH_USER_COLUMNS)
      .eq("id", link.user_id)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      return data as DbAuthUser;
    }
  }

  const { data: legacy, error: legacyError } = await supabase
    .from("users")
    .select(AUTH_USER_COLUMNS)
    .eq("provider", provider)
    .eq("providerAccountId", providerAccountId)
    .limit(1);

  if (legacyError) {
    throw new Error(legacyError.message);
  }

  return (legacy?.[0] as DbAuthUser | undefined) ?? null;
}

type EmailMatch =
  | { kind: "none" }
  | { kind: "ambiguous" }
  | { kind: "found"; user: DbAuthUser; hasPassword: boolean };

// The password hash is only read to learn whether one is set; it is never
// returned from here.
function toEmailMatch(row: DbAuthUser & { password?: string | null }): EmailMatch {
  const { password, ...user } = row;
  return { kind: "found", user, hasPassword: !!password };
}

async function findUserByEmail(email: string): Promise<EmailMatch> {
  const { data: exact, error } = await supabase
    .from("users")
    .select(`${AUTH_USER_COLUMNS}, password`)
    .eq("email", email)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }
  if (exact?.[0]) {
    return toEmailMatch(exact[0] as DbAuthUser & { password: string | null });
  }

  // Same address with different casing - usable only when it is unambiguous.
  const { data: similar, error: similarError } = await supabase
    .from("users")
    .select(`${AUTH_USER_COLUMNS}, password`)
    .ilike("email", email.replace(/[%_\\]/g, "\\$&"))
    .limit(2);

  if (similarError) {
    throw new Error(similarError.message);
  }

  if (!similar?.length) {
    return { kind: "none" };
  }
  if (similar.length > 1) {
    return { kind: "ambiguous" };
  }
  return toEmailMatch(similar[0] as DbAuthUser & { password: string | null });
}

// Where a refused social sign-in lands; the login page explains each code.
const ACCOUNT_EXISTS_URL = "/login?error=AccountExists";
const SOCIAL_SIGNIN_UNAVAILABLE_URL = "/login?error=SocialSignInUnavailable";

async function hasOtherProviderAccount(
  dbUser: DbAuthUser,
  provider: string,
  providerAccountId: string
): Promise<boolean> {
  if (
    dbUser.provider === provider &&
    dbUser.providerAccountId &&
    dbUser.providerAccountId !== providerAccountId
  ) {
    return true;
  }

  const { data, error } = await supabase
    .from("user_oauth_accounts")
    .select("id")
    .eq("user_id", dbUser.id)
    .eq("provider", provider)
    .neq("provider_account_id", providerAccountId)
    .limit(1);

  if (error && !isMissingTable(error)) {
    throw new Error(error.message);
  }

  return !!data?.length;
}

async function linkProviderAccount(
  userId: number | string,
  provider: string,
  providerAccountId: string
) {
  const { error } = await supabase
    .from("user_oauth_accounts")
    .upsert(
      { user_id: userId, provider, provider_account_id: providerAccountId },
      { onConflict: "provider,provider_account_id", ignoreDuplicates: true }
    );

  // Not fatal: the legacy columns written above still identify this login.
  if (error && !isMissingTable(error)) {
    console.error("signIn: failed to record provider account link", error);
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: { scope: "email" },
      },
    }),

    CredentialsProvider({
          name: "Credentials",
          credentials: {
            email: {},
            password: {},
          },
          async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
              throw new Error("Email and password are required");
            }
    
            const { data: users, error } = await supabase
              .from("users")
              .select("*")
              .eq("email", credentials.email)
              .limit(1);
    
            if (error) {
              throw new Error(error.message);
            }
    
            if (!users || users.length === 0) {
              throw new Error("User not found");
            }
    
            const user = users[0];
    
            const isMatch = await bcrypt.compare(
              credentials.password,
              user.password
            );
    
            if (!isMatch) {
              throw new Error("Invalid password");
            }
    
            return {
              id: user.id.toString(),
              name: user.full_name,
              email: user.email,
              role: user.role,
            };
          },
        }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/auth-error",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (
        account?.provider === "google" ||
        account?.provider === "facebook"
      ) {
        const provider = account.provider;
        const providerAccountId = account.providerAccountId;

        if (!providerAccountId) {
          return false;
        }

        // A known provider identity always resolves to its own account,
        // whatever that account's email is now (it may have been changed on
        // My Account).
        let dbUser = await findUserByProviderAccount(provider, providerAccountId);

        if (!dbUser) {
          // First sign-in with this identity, and only for an address the
          // provider vouches for. Google says so explicitly; Facebook only
          // returns an email the user has confirmed.
          if (!user.email) {
            return false;
          }
          if (provider === "google" && (profile as { email_verified?: boolean } | undefined)?.email_verified !== true) {
            return false;
          }

          const match = await findUserByEmail(user.email);

          // Several accounts differ only by letter case: neither can be
          // picked safely, and creating another would add a third.
          if (match.kind === "ambiguous") {
            return SOCIAL_SIGNIN_UNAVAILABLE_URL;
          }

          if (match.kind === "found") {
            // Signup does not verify email ownership, so a password account
            // with this address may have been created by someone else. Never
            // attach a provider identity to it on a matching email alone -
            // the owner signs in with the password (or resets it via the
            // mailbox) instead.
            if (match.hasPassword) {
              return ACCOUNT_EXISTS_URL;
            }

            // Never attach a second, different identity of the same provider
            // to an account that already has one.
            if (await hasOtherProviderAccount(match.user, provider, providerAccountId)) {
              return false;
            }

            dbUser = match.user;
          }
        }

        if (!dbUser) {
          const { data: created, error } = await supabase
            .from("users")
            .insert({
              full_name: user.name,
              email: user.email,
              provider,
              providerAccountId,
              role: "guest_teacher",
            })
            .select("id, email, full_name, role, provider, providerAccountId")
            .single();

          if (error) {
            throw new Error(error.message);
          }

          dbUser = created as DbAuthUser;
        } else {
          // Record the last provider used, as before, but keep the user's
          // own display name - only fill it in when the account has none.
          const updates: Record<string, string | null | undefined> = {
            provider,
            providerAccountId,
          };
          if (!dbUser.full_name?.trim() && user.name) {
            updates.full_name = user.name;
          }

          const { error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", dbUser.id);

          if (error) {
            throw new Error(error.message);
          }
        }

        await linkProviderAccount(dbUser.id, provider, providerAccountId);

        user.id = dbUser.id.toString();
        user.role = dbUser.role;
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },

    async jwt({ token, user }) {
      // At sign-in `user.id` is the users.id resolved by authorize() or the
      // signIn callback above. After that the id is the only thing trusted
      // from the token: email, name and role are re-read from the users row
      // on every session check, so an email change keeps resolving to the
      // same account. Session-update payloads sent by the client (the
      // `session` argument on trigger "update") are deliberately ignored -
      // an update() call only causes this refresh from the database.
      if (user) {
        token.id = user.id;
      }

      if (!token.id) {
        throw new Error("Session has no user id");
      }

      let dbUser: { id: number | string; email: string | null; full_name: string | null; role: string | null } | null = null;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, email, full_name, role")
          .eq("id", token.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        dbUser = data;
      } catch (err) {
        // A transient Supabase/network failure must not sign a still-valid
        // user out, but it must not leave an unverified role usable either:
        // keep the identity, drop the role until the next successful check.
        console.error("jwt callback: failed to refresh user, dropping role for this check", err);
        token.role = null;
        return token;
      }

      if (!dbUser) {
        // The account was deleted. Throwing here clears the session cookie
        // and getServerSession() returns null, so a stale JWT stops working.
        throw new Error("Session user no longer exists");
      }

      token.id = dbUser.id.toString();
      token.email = dbUser.email;
      token.name = dbUser.full_name;
      token.role = dbUser.role ?? null;

      return token;
    },

    async session({ session, token }) {
      // NextAuth builds session.user.name/email from the cookie as it was
      // before the jwt callback ran, so copy the refreshed values over.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string | null) ?? null;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};