import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async signIn({ user, account }) {
      // تتبع تسجيل الدخول - إرسال البيانات لـ Google Sheets
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/track-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
            provider: account?.provider,
            lastLogin: new Date().toISOString(),
          }),
        });
        console.log("📊 Login tracked:", user.email);
      } catch (error) {
        console.error("❌ Failed to track login:", error);
      }
      return true; // السماح بتسجيل الدخول
    },
  },
})

export { handler as GET, handler as POST }