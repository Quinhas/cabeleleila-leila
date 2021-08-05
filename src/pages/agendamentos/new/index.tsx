import {
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import CreateAgendamentoForm from "@components/CreateAgendamentoForm";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type AgendamentoProps = {
  date: string;
  services: { name: string; desc: string; value: number }[];
  phone: string;
  status: string;
  id: string;
};

export default function Agendamentos() {
  const { user, isLogged } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!isLogged) {
      router.push("/");
      return;
    }
  }, [isLogged, router]);

  return (
    <>
      <Navbar />
      <Flex
        grow={1}
        py={"2rem"}
        direction={"column"}
        gridGap={"1rem"}
        align={"center"}
        px={"2rem"}
      >
        <Heading>Agendar Serviço</Heading>
        <CreateAgendamentoForm />
      </Flex>
    </>
  );
}
