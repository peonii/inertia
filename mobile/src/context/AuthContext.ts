import { createContext, useContext } from "react";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
