import * as AuthSession from "expo-auth-session";
import { BACKEND_URL, GOOGLE_CLIENT_ID } from "@env";

const REDIRECT_URI = AuthSession.makeRedirectUri();

export default function useAuthRequest() {
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["profile", "email"],
      redirectUri: REDIRECT_URI,
      responseType: "code",
    },
    {
      authorizationEndpoint: `${BACKEND_URL}/auth/google`,
    }
  );

  return { request, promptAsync };
}
