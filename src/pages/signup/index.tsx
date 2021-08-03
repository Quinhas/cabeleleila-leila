import { FaGoogle, FaMoon, FaSun } from "react-icons/fa";
import { useAuth } from "@hooks/useAuth";
import {
  Flex,
  Button,
  useColorMode,
  LightMode,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import React from "react";
import { useRouter } from "next/router";
import Logo from "@components/Logo";
import LoginForm from "@components/LoginForm";
import SignUpForm from "@components/SignUpForm";

export default function Login() {
  const { isLogged, signInWithGoogle } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  async function handleGoogleButton() {
    if (!isLogged) {
      await signInWithGoogle();
      router.push("/");
    }
  }

  if (isLogged) {
    router.push("/");
  }

  return (
    <Flex grow={1} direction={"column"} p={"2rem"}>
      <Flex justify={"flex-end"}>
        <IconButton
          aria-label="Toggle theme"
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          variant={"outline"}
          colorScheme="primaryApp"
          borderRadius={"md"}
        />
      </Flex>
      <Flex grow={1} align={"center"} justify={"center"}>
        <Flex
          direction={"column"}
          w={"sm"}
          textAlign={"center"}
          gridGap={"2rem"}
          maxW={"22rem"}
        >
          <Flex align={"center"} direction={"column"} gridGap={"0.5rem"}>
            <Logo boxSize={"7rem"} />
            <Heading
              color={
                colorMode === "light" ? "primaryApp.600" : "primaryApp.400"
              }
            >
              Cabeleleila Leila
            </Heading>
          </Flex>

          <SignUpForm />
          <Flex
            fontSize={"0.875rem"}
            color={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.500"}
            align={"center"}
            _before={{
              content: `''`,
              flex: 1,
              height: "1px",
              background: `${
                colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.500"
              }`,
              marginRight: "1rem",
            }}
            _after={{
              content: `''`,
              flex: 1,
              height: "1px",
              background: `${
                colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.500"
              }`,
              marginLeft: "1rem",
            }}
          >
            ou
          </Flex>
          <LightMode>
            <Button
              leftIcon={<FaGoogle />}
              colorScheme={"google"}
              onClick={handleGoogleButton}
              h={"2.875rem"}
              fontWeight={500}
            >
              Continue com o Google
            </Button>
          </LightMode>
        </Flex>
      </Flex>
    </Flex>
  );
}
