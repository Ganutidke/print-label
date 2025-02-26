import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { comparePassword } from "@/utils/bcrypt";
import User from "@/models/User";
import connectDB from "@/lib/db";
import { ObjectId } from "mongoose";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Invalid credentials");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        console.log(user);
        if (!user || !(await comparePassword(credentials.password, user.password))) {
          throw new Error("Invalid credentials");
        }

        return { id: (user._id as ObjectId).toString(), name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store user ID in the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Attach user ID to the session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
