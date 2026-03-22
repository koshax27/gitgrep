import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
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
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        
        await fetch(`${baseUrl}/api/track-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: user.name,
            email: user.email,
            provider: account?.provider,
          }),
        });
        
        console.log("📊 Login tracked:", user.email);
      } catch (error) {
        console.error("❌ Failed to track login:", error);
      }
      return true;
    },
  },
}