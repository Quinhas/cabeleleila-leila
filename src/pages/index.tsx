import { Flex, Heading, Icon, IconButton, Text, useColorMode } from "@chakra-ui/react";
import Logo from "@components/Logo";
import { Navbar } from "@components/Navbar";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Navbar />
  );
}
