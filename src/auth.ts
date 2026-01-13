import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

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
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(password, user.password)

                if (!isPasswordValid) {
                    console.log("Login failed: Invalid password");
                    return null;
                }

                console.log("Login success for:", email);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    // FIX: Map Base64 image to API URL immediately with cache busting
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
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.plan = (user as any).plan;
                token.id = user.id;
            } else if (token.sub) {
                // Fetch fresh data from DB to ensure session is up-to-date
                try {
                    // We can use the existing prisma client
                    // Note: We need to import prisma if not captured in closure, 
                    // but 'prisma' is imported at top level so it's fine.
                    const freshUser = await prisma.user.findUnique({
                        where: { id: token.sub }, // token.sub is usually the user ID
                    });

                    if (freshUser) {
                        token.name = freshUser.name;
                        token.email = freshUser.email;
                        token.role = freshUser.role;
                        token.plan = freshUser.plan;

                        // FIX: Don't put large base64 images in the token/cookie (Causes 431 Error)
                        // FIX: Don't put large base64 images in the token/cookie (Causes 431 Error)
                        // FIX: Use API URL for base64 images to prevent 431 errors
                        if (freshUser.image && freshUser.image.startsWith("data:")) {
                            token.image = `/api/user/avatar/${freshUser.id}?v=${freshUser.updatedAt.getTime()}`;
                        } else {
                            token.image = freshUser.image;
                        }

                        // Remove legacy flag if present
                        delete (token as any).isCustomImage;
                    }
                } catch (error) {
                    console.error("Error fetching fresh user data in JWT:", error);
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role as string;
                (session.user as any).plan = token.plan as string;
                session.user.image = token.image as string;
                (session.user as any).isCustomImage = token.isCustomImage as boolean;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/", // We use a modal, but redirecting to home is fine if something goes wrong
    },
})
