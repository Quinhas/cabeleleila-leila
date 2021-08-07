import {
  Button,
  Flex,
  IconButton,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useColorMode,
} from "@chakra-ui/react";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { AgendamentoProps } from "@utils/types";
import {
  isAfter,
  format,
  formatDistanceToNow,
  parseISO,
  formatDistanceToNowStrict,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { FaCheck, FaPencilAlt, FaTrashAlt } from "react-icons/fa";

export default function AgendamentoCard(agendamento: AgendamentoProps) {
  const { isAdmin } = useAuth();
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <Flex
      boxShadow={"sm"}
      borderRadius={"md"}
      bg={colorMode === "light" ? "white" : "black"}
      p={"1rem"}
      w={["100%", "calc(25% - 1rem)"]}
      minH={"10rem"}
      direction={"column"}
      gridGap={"0.5rem"}
      opacity={isAfter(new Date(), parseISO(agendamento.date)) ? "0.5" : "1"}
    >
      <Flex direction={"column"} gridGap={"0.2rem"}>
        <Text fontWeight={"semibold"}>
          {format(parseISO(agendamento.date), "P", { locale: ptBR })} -{" "}
          {agendamento.hour}
        </Text>
        {format(parseISO(agendamento.date), "P", { locale: ptBR }) ===
          format(new Date(), "P", { locale: ptBR }) && (
          <Text
            fontWeight={"semibold"}
            color={"primaryApp.500"}
            fontFamily={"heading"}
          >
            Hoje
          </Text>
        )}
        {isAdmin && (
          <Text fontSize={"0.875rem"}>Cliente: {agendamento.name}</Text>
        )}
        <Text fontSize={"0.875rem"}>
          Status:{" "}
          <Text as={"span"} fontWeight={"semibold"}>
            {agendamento.status}
          </Text>
        </Text>
        <UnorderedList>
          {agendamento.services.map((service) => {
            return (
              <ListItem key={service.id} fontSize={"0.875rem"}>
                {service.name} - {service.priceFormatted} | {service.hour}
              </ListItem>
            );
          })}
        </UnorderedList>
        <Text fontSize={"0.875rem"} textAlign={"end"}>
          Total:{" "}
          <Text as={"span"} fontWeight={"semibold"}>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(agendamento.services.reduce((a, b) => a + b.price, 0))}
          </Text>
        </Text>
      </Flex>
      {agendamento.status !== "Finalizado" &&
        (isAdmin ||
          Number(
            formatDistanceToNowStrict(parseISO(agendamento.date), {
              unit: "day",
            }).split(" ")[0]
          ) > 2) && (
          <Flex mt={"auto"} justify={"flex-end"}>
            {agendamento.status !== "Cancelado" && (
              <IconButton
                aria-label="Cancelar"
                colorScheme={"danger"}
                size={"sm"}
                variant={"ghost"}
                icon={<FaTrashAlt />}
                onClick={async () => {
                  await database
                    .ref(`agendamentos/${agendamento.id}`)
                    .update({ status: "Cancelado" });
                }}
              />
            )}

            <IconButton
              aria-label="Alterar"
              colorScheme={"primaryApp"}
              size={"sm"}
              variant={"ghost"}
              icon={<FaPencilAlt />}
              onClick={() => {
                router.push(`/agendamentos/${agendamento.id}`);
              }}
            />
            {isAdmin &&
              (agendamento.status === "Pendente" ||
                agendamento.status === "Cancelado") && (
                <IconButton
                  aria-label="Confirmar"
                  colorScheme={"success"}
                  size={"sm"}
                  variant={"ghost"}
                  icon={<FaCheck />}
                  onClick={async () => {
                    await database
                      .ref(`agendamentos/${agendamento.id}`)
                      .update({ status: "Confirmado" });
                  }}
                />
              )}
            {isAdmin && agendamento.status === "Confirmado" && (
              <Button
                aria-label="Finalizar"
                colorScheme={"success"}
                size={"sm"}
                variant={"outline"}
                icon={<FaCheck />}
                onClick={async () => {
                  await database
                    .ref(`agendamentos/${agendamento.id}`)
                    .update({ status: "Finalizado" });
                }}
              >
                Finalizar
              </Button>
            )}
          </Flex>
        )}
    </Flex>
  );
}
