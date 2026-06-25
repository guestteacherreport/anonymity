import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

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
    async signIn({ user, account }) {
      if (
        account?.provider === "google" ||
        account?.provider === "facebook"
      ) {
        if (!user.email) {
          return false;
        }

        const { data: existingUsers, error: checkError } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", user.email)
          .limit(1);

        if (checkError) {
          throw new Error(checkError.message);
        }

        const existingUser = existingUsers?.[0];

        if (!existingUser) {
          const { data: userD, error } = await supabase
            .from("users")
            .insert({
              full_name: user.name,
              email: user.email,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              role: "guest_teacher",
            })
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }

          user.id = userD.id.toString();
          user.role = userD.role;
        } else {
          const { data: userD, error } = await supabase
            .from("users")
            .update({
              full_name: user.name,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            })
            .eq("email", user.email)
            .select()
            .single();

          if (error) {
            throw new Error(error.message);
          }

          user.id = userD.id.toString();
          user.role = userD.role;
        }

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

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? null;
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      if (token.email) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, role")
          .eq("email", token.email)
          .single();

        if (dbUser) {
          token.id = dbUser.id.toString();
          token.role = dbUser.role ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string | null) ?? null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
