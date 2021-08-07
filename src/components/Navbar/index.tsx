import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Logo from "@components/Logo";
import Menu from "@components/Menu";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/router";
import React from "react";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

export function Navbar() {
  const { isLogged, isAdmin, signOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        description: "Usuário deslogado com sucesso.",
        status: "success",
      });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <>
      <Flex
        h={"4rem"}
        bg={colorMode === "light" ? "white" : "black"}
        align={"center"}
        px={"1.5rem"}
        justify={"space-between"}
        boxShadow={"sm"}
        top={0}
        position={'sticky'}
        zIndex={999}
      >
        <Flex
          gridGap={"1rem"}
          align={"center"}
          onClick={() => router.push("/")}
          cursor={"pointer"}
        >
          <Logo boxSize={"2rem"} />
          <Heading fontSize={"1.5rem"} fontWeight={"bold"}>
            Cabeleleila Leila
          </Heading>
        </Flex>
        {!isLogged && (
          <Flex gridGap={"0.5rem"}>
            <Button
              colorScheme={"primaryApp"}
              onClick={() => router.push("login")}
            >
              Login
            </Button>
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
              onClick={toggleColorMode}
              variant={"outline"}
              colorScheme="primaryApp"
              borderRadius={"md"}
            />
          </Flex>
        )}
        {isLogged && (
          <IconButton
            aria-label="Menu"
            fontSize={"1.25rem"}
            icon={<FaBars />}
            onClick={onOpen}
            variant={"outline"}
            colorScheme="primaryApp"
            borderRadius={"md"}
          />
        )}
      </Flex>
      {isLogged && (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg={colorMode === "light" ? "white" : "black"}>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>

            <DrawerBody>
              <Menu />
            </DrawerBody>

            <DrawerFooter justifyContent={"space-between"}>
              <IconButton
                aria-label="Toggle theme"
                icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant={"outline"}
                colorScheme="primaryApp"
                borderRadius={"md"}
              />
              <Button onClick={handleLogout}>Sair</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
