import {
  Button,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import CreateAgendamentoForm from "@components/CreateAgendamentoForm";
import ModalService from "@components/ModalService";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { database } from "@services/firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";

type ServiceProps = {
  name: string;
  desc: string;
  price: number;
  priceFormatted: string;
  id: string;
};

export default function Agendamentos() {
  const { isAdmin, isLogged } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceProps>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setLoading(true);
    if (!isAdmin || !isLogged) {
      router.push("/");
      return;
    }
    const servicesRef = database.ref(`servicos/`);
    servicesRef.on("value", async (snap) => {
      const res: Record<
        string,
        { name: string; desc: string; price: number; id: string }
      > = snap.val();
      const services: ServiceProps[] = Object.values(res ?? []).map(
        (service) => {
          return {
            desc: service.desc,
            id: service.id,
            name: service.name,
            priceFormatted: new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(service.price),
            price: Number(service.price),
          };
        }
      );
      setServices(services);
    });
    setLoading(false);
  }, [isAdmin, isLogged, router]);

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
        <Flex gridGap={"1rem"} align={"center"}>
          <Heading>Serviços</Heading>
          <Button colorScheme={"secondaryApp"} onClick={onOpen}>
            Cadastrar
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
        {!loading && services?.length === 0 && (
          <Flex direction={"column"} gridGap={"1rem"} grow={1}>
            <Text fontSize={"1.25rem"} color={"gray.500"}>
              Você não possui nenhum serviço cadastrado 🙁.
            </Text>
          </Flex>
        )}
        {!loading && services?.length !== 0 && (
          <Flex gridGap={"1rem"} wrap={"wrap"}>
            {services.map((service) => (
              <Flex
                key={service.id}
                boxShadow={"sm"}
                borderRadius={"md"}
                bg={colorMode === "light" ? "white" : "black"}
                p={"1rem"}
                w={["100%", "calc(20% - 1rem)"]}
                minH={"10rem"}
                direction={"column"}
                gridGap={"0.5rem"}
              >
                <Flex align={"center"} justify={"space-between"}>
                  <Text
                    fontWeight={"semibold"}
                    fontSize={"1.25rem"}
                    fontFamily={"heading"}
                  >
                    {service.name}
                  </Text>
                  <IconButton
                    aria-label={"Editar"}
                    icon={<FaPencilAlt />}
                    size={"sm"}
                    variant={"ghost"}
                    colorScheme={"primaryApp"}
                    onClick={() => {
                      setSelectedService(service);
                      onOpen();
                    }}
                  />
                </Flex>
                <Text noOfLines={4} color={"gray.500"}>
                  {service.desc}
                </Text>
                <Text
                  fontWeight={"semibold"}
                  fontSize={"1.25rem"}
                  alignSelf={"flex-end"}
                  mt={"auto"}
                  color={"complementaryApp.500"}
                  fontFamily={"heading"}
                >
                  {service.priceFormatted}
                </Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
      <ModalService
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedService(undefined);
        }}
        desc={selectedService?.desc}
        name={selectedService?.name}
        price={selectedService?.price}
        id={selectedService?.id}
      />
    </>
  );
}
