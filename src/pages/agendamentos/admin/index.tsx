import {
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import AgendamentoCard from "@components/AgendamentoCard";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { AgendamentoProps } from "@utils/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

export default function AgendamentosAdmin() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualPage, setActualPage] = useState(0);
  const { user, isLogged, isAdmin } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();

  useEffect(() => {
    setLoading(true);
    if (!isLogged || !user?.id || !isAdmin) {
      router.push("/");
      return;
    }
    const agendamentosRef = database.ref(`agendamentos`);
    agendamentosRef.on("value", async (snap) => {
      const res: Record<string, AgendamentoProps> = snap.val();
      const agendamentos: AgendamentoProps[] = await Promise.all(
        Object.values(res ?? []).map(async (agendamento) => {
          return {
            ...agendamento,
          };
        })
      );
      setAgendamentos(agendamentos);
      setLoading(false);
    });

    return () => {
      agendamentosRef.off("value");
    };
  }, [isAdmin, isLogged, router, user?.id]);

  return (
    <>
      <Navbar />
      <Flex
        grow={1}
        py={"2rem"}
        direction={"column"}
        gridGap={"1rem"}
        px={"2rem"}
      >
        <Flex align={"center"} gridGap={"0.5rem"}>
          <Heading>Agendamentos</Heading>
          <Button
            size={"sm"}
            colorScheme={"primaryApp"}
            onClick={() => router.push("/agendamentos/new")}
          >
            Novo Agendamento
          </Button>
        </Flex>
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
          <Flex gridGap={"1rem"} wrap={"wrap"} borderRadius={"md"}>
            {agendamentos.map((agendamento) => (
              <AgendamentoCard key={agendamento.id} {...agendamento} />
            ))}
          </Flex>
        )}
      </Flex>
    </>
  );
}
