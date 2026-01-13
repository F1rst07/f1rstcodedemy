import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

class UserNotFound extends CredentialsSignin {
    code = "UserNotFound"
}
class InvalidPassword extends CredentialsSignin {
    code = "InvalidPassword"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Login failed: Missing credentials");
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                console.log("Attempting login for:", email);

                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                })

                if (!user || !user.password) {
                    console.log("Login failed: User not found or no password set");
                    throw new UserNotFound();
                }

                const isPasswordValid = await bcrypt.compare(password, user.password)

                if (!isPasswordValid) {
                    console.log("Login failed: Invalid password");
                    throw new InvalidPassword();
                }

                console.log("Login success for:", email);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    // Use API URL for images to prevent large cookies
                    image: (user.image && user.image.startsWith("data:"))
                        ? `/api/user/avatar/${user.id}?v=${user.updatedAt.getTime()}`
                        : user.image,
                    role: user.role,
                    plan: user.plan,
                }
            },
        }),
    ],
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Updated user data from client side
            if (trigger === "update" && session?.user) {
                return { ...token, ...session.user };
            }

            // Initial login - store all data in token
            if (user) {
                token.role = (user as any).role;
                token.plan = (user as any).plan;
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                // Store image URL (not base64) in token
                token.image = (user as any).image;
                token.picture = (user as any).image;
            }

            // NO MORE DATABASE QUERIES HERE - use cached token data
            // This dramatically improves performance

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                (session.user as any).role = token.role as string;
                (session.user as any).plan = token.plan as string;
                session.user.image = token.image as string || token.picture as string;
                session.user.name = token.name;
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/",
    },
})
