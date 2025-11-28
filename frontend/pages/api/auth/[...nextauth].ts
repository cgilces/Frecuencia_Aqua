
import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { supabase } from "../../../supabaseClient";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  session: {
    strategy: "jwt", // Manejo de sesiones mediante Tokens JWT en Cookies
  },
  callbacks: {
    // 1. Al hacer login, buscamos los permisos del usuario en Supabase
    async jwt({ token, user, account }) {
      if (account && user) {
        // Usamos el email o el nombre del Keycloak para buscar en nuestra tabla de usuarios
        // Nota: Asumimos que el 'username' en app_users coincide con el email o username de Keycloak
        const { data: dbUser } = await supabase
          .from('app_users')
          .select('*')
          .eq('username', user.name || user.email) 
          .single();

        // Guardamos los datos de rol en el token encriptado
        token.id = user.id;
        token.role = dbUser?.role || 'VENDEDOR'; // Default
        token.assigned_routes = dbUser?.assigned_routes || [];
        token.username = user.name || "";
      }
      return token;
    },
    // 2. Exponemos los datos del token en la sesión del cliente
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'ADMIN' | 'VENDEDOR' | 'DESPACHADOR';
        session.user.assigned_routes = token.assigned_routes as string[];
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Opcional: página custom
  }
};

export default NextAuth(authOptions);
