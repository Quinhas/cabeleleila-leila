import { Text, Flex, Spinner, useColorMode } from "@chakra-ui/react";
import { ReactNode, useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { auth, database, firebase } from "@services/firebase";
import Router from "next/router";

type User = {
  id: string;
  name: string;
  avatar?: string | null;
  email: string;
  role?: string;
};

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
  createUserWithEmailAndPassword: (
    email: string,
    password: string,
    name: string
  ) => Promise<void>;
  signInWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isLogged: boolean;
  isAdmin: boolean;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const { displayName, photoURL, uid, email } = user;
        if (!email || !uid) {
          return;
        }
        const newUser = {
          id: uid,
          name: displayName || "Usuário",
          avatar: photoURL?.split("=")[0] ?? null,
          email: email,
        };

        await database.ref(`users/${newUser.id}`).update(newUser);
        const firebaseUser = (
          await database.ref(`users/${newUser.id}`).once("value")
        ).val();
        if (firebaseUser.role === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setUser({
          email: firebaseUser.email,
          id: firebaseUser.id,
          name: firebaseUser.name,
          avatar: firebaseUser.avatar,
          role: firebaseUser.role,
        });
        setIsLogged(true);
        setLoading(false);
      } else {
        setIsLogged(false);
        setUser(undefined);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function createUserWithEmailAndPassword(
    email: string,
    password: string,
    name: string
  ) {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    if (result.user) {
      await result.user.updateProfile({
        displayName: name,
      });
      const { displayName, photoURL, uid } = result.user;

      const newUser: User = {
        id: uid,
        name: name ?? displayName,
        avatar: photoURL?.split("=")[0] ?? null,
        email: email,
      };

      await database.ref(`/users/${newUser.id}`).update(newUser);

      setUser(newUser);
      setIsLogged(true);
    }
  }

  async function signInWithEmailAndPassword(email: string, password: string) {
    await auth.signInWithEmailAndPassword(email, password);
  }

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  }

  async function signOut() {
    await auth.signOut();
    setIsLogged(false);
  }

  if (loading) {
    return (
      <Flex w={"100vw"} h={"100vh"} align={"center"} justify={"center"}>
        <Flex
          direction={"column"}
          align="center"
          gridGap={"1.5rem"}
          bg={colorMode === "light" ? "white" : "black"}
          boxShadow={"md"}
          py={"2rem"}
          px={"4rem"}
          borderRadius={"md"}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="primaryApp.500"
            size="xl"
          />
          <Text color="gray.500" fontFamily={'heading'}>Carregando...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        createUserWithEmailAndPassword,
        signInWithEmailAndPassword,
        signOut,
        isLogged,
        isAdmin,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
