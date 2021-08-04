import {
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type AgendamentoProps = {
  date: string;
  hour: string;
  services: { name: string; desc: string; value: number }[];
  phone: string;
  status: string;
  id: string;
};

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualPage, setActualPage] = useState(0);
  const { user, isLogged } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();

  useEffect(() => {
    setLoading(true);
    if (!isLogged || !user?.id) {
      router.push("/");
      return;
    }
    const agendamentosRef = database
      .ref(`agendamentos`)
      .orderByChild("customerUid")
      .equalTo(user.id);
    agendamentosRef.on("value", async (snap) => {
      setLoading(false);
    });

    return () => {
      agendamentosRef.off("value");
    };
  }, [isLogged, router, user?.id]);

  return (
    <>
      <Navbar />
      <Flex
        grow={1}
        py={"1.125rem"}
        px={"1.5rem"}
        direction={"column"}
        w={"100%"}
        gridGap={"1rem"}
      >
        <Heading>Agendamentos</Heading>
        <Flex grow={1}>
          {loading && (
            <Flex
              direction={"column"}
              align="center"
              gridGap={"1.5rem"}
              grow={1}
              justify={"center"}
            >
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="primaryApp.500"
                size="xl"
              />
              <Text color="gray.500" fontFamily={"heading"}>
                Carregando...
              </Text>
            </Flex>
          )}
          {!loading && agendamentos && agendamentos.length === 0 && (
            <Flex direction={"column"} gridGap={"1rem"} grow={1} align="center">
              <Text fontSize={"1.25rem"} color={"gray.500"}>
                Você não possui nenhum agendamento 🙁.
              </Text>
              <Button
                colorScheme={"primaryApp"}
                onClick={() => router.push("/agendamentos/new")}
              >
                Agendar serviço
              </Button>
            </Flex>
          )}
          {!loading && agendamentos && agendamentos.length !== 0 && (
            <Flex
              direction={"column"}
              gridGap={"1.5rem"}
              grow={1}
              borderRadius={"md"}
            >
              {agendamentos.map((agendamento) => (
                <Flex
                  key={agendamento.id}
                  bg={colorMode === "light" ? "white" : "black"}
                ></Flex>
              ))}
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  );
}
