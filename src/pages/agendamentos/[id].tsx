import {
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import AgendamentoForm from "@components/AgendamentoForm";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { AgendamentoProps, ServiceProps } from "@utils/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditarAgendamento() {
  const [agendamento, setAgendamento] = useState<AgendamentoProps>();
  const { user, isLogged } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!isLogged) {
      router.push("/");
      return;
    }
    const uid = router.query.id;
    const agendamentoRef = database.ref(`agendamentos/${uid}`);
    agendamentoRef.on("value", (snap) => {
      const res: AgendamentoProps = snap.val();
      setAgendamento(res);
    });

    return () => {
      agendamentoRef.off("value");
    };
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
        <Heading>Editar Agendamento</Heading>
        {agendamento && <AgendamentoForm {...agendamento} />}
      </Flex>
    </>
  );
}
