import { createContext, useContext } from "react";
import { Game, Team, User } from "../types";

export type DataContextType = {
    userData: User | "loading"
    setUserData: (user: User | "loading") => void
    gamesData: Game[] | "loading"
    setGamesData: (game: Game[] | "loading") => void
    teamsData: Team[] | "loading"
    setTeamsData: (team: Team[] | "loading") => void
};

export const DataContext = createContext<DataContextType>({
    userData: "loading",
    setUserData: () => { },
    gamesData: "loading",
    setGamesData: () => { },
    teamsData: "loading",
    setTeamsData: () => { }
});

export const useDataContext = () => {
    return useContext(DataContext);
};
