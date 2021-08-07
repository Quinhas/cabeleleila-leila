import {
  AspectRatio,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import Logo from "@components/Logo";
import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/router";
import { FaMoon, FaSun } from "react-icons/fa";

export default function Home() {
  const { isLogged, isAdmin } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  return (
    <>
      <Navbar />
      <Flex
        h={"20rem"}
        boxShadow={"sm"}
        bg={"secondaryApp.500"}
        align={"center"}
        justify={"center"}
        gridGap={"2rem"}
        direction={"column"}
      >
        <Flex gridGap={"1rem"} align={"center"}>
          <Logo boxSize={"5rem"} />
          <Flex direction={"column"} color={"gray.100"}>
            <Heading>Cabeleleila Leila</Heading>
            <Text>Tudo esterilizado pra você não ficar mal</Text>
          </Flex>
        </Flex>
        {isLogged && (
          <Flex>
            <Button
              colorScheme={"primaryApp"}
              onClick={() => router.push("/agendamentos/new")}
            >
              Agendar um serviço
            </Button>
          </Flex>
        )}
      </Flex>
      <Flex mt={"2rem"} gridGap={"1rem"} justify={"center"}>
        <AspectRatio w="430px" ratio={16 / 9}>
          <iframe
            src="https://www.youtube.com/embed/j6wUf_5nH7c"
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </AspectRatio>
        <Flex direction={"column"} w={"40%"} gridGap={"1rem"}>
          <Heading>Quem Somos</Heading>
          <Text>
            O salão de cabelo da cabeleleira Leila não se caba da alegria, as
            demandas de cabelo e de unha é tanta que perdemos nossa linha,
            compramos todo o prédio, e fundamos O CENTRO DE BELEILA LEILA
            CABELELEIRO, O CENTRO DE CABELOS BEAUTY CENTER DA CABELELEILA LEILA!
            Venha fazer suas embalaiagens, suas luzes, e suas lâmpadas conosco.
          </Text>
        </Flex>
      </Flex>
    </>
  );
}
