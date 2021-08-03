import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  useColorMode,
  useToast,
  Text,
} from "@chakra-ui/react";
import { Form, Field, Formik } from "formik";
import { useRouter } from "next/router";
import { FaSignInAlt } from "react-icons/fa";
import { useAuth } from "src/hooks/useAuth";
import * as yup from "yup";

type FormValues = {
  email?: string;
  password?: string;
};

export default function LoginForm(props: FormValues) {
  const { signInWithEmailAndPassword } = useAuth();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const router = useRouter();

  const SignUpSchema = yup.object().shape({
    email: yup.string().email("Email inválido").required("Campo obrigatório."),
    password: yup
      .string()
      .required("Campo obrigatório.")
      .min(6, "A senha deve ter mais de 6 caracteres."),
  });

  const initialValues = {
    email: props.email || "",
    password: props.password || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        try {
          await signInWithEmailAndPassword(values.email, values.password);
          toast({
            description: "Usuário logado com sucesso.",
            status: "success",
            isClosable: true,
          });
          router.push("/");
        } catch (error) {
          toast({
            description: error.message,
            status: "error",
            isClosable: true,
            duration: 9000,
          });
        }
      }}
      validationSchema={SignUpSchema}
    >
      {({
        touched,
        errors,
        dirty,
        isValid,
        handleBlur,
        handleChange,
        values,
        isSubmitting,
      }) => (
        <Flex as={Form} gridGap={"0.5rem"} direction={"column"}>
          <FormControl isInvalid={errors.email && touched.email ? true : false}>
            <Input
              as={Field}
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="E-mail"
              bg={colorMode === "light" ? "white" : "black"}
              color={
                colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"
              }
              h={"2.875rem"}
              borderRadius={"0.5rem"}
              p={"0 1rem"}
              border={"1px solid"}
              w={"100%"}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>
          <FormControl
            isInvalid={errors.password && touched.password ? true : false}
          >
            <Input
              as={Field}
              id="password"
              type="password"
              name="password"
              placeholder="Senha"
              onChange={handleChange}
              onBlur={handleBlur}
              bg={colorMode === "light" ? "white" : "black"}
              color={
                colorMode === "light" ? "blackAlpha.800" : "whiteAlpha.800"
              }
              h={"2.875rem"}
              borderRadius={"0.5rem"}
              p={"0 1rem"}
              border={"1px solid"}
              w={"100%"}
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            variant={"app"}
            w={"100%"}
            mt={"1rem"}
            rightIcon={<FaSignInAlt />}
            isDisabled={!dirty || !isValid}
            isLoading={isSubmitting}
          >
            Entrar
          </Button>
          <Text
            fontSize={"0.875rem"}
            color={colorMode === "light" ? "blackAlpha.700" : "whiteAlpha.600"}
          >
            Ainda não tem conta?{" "}
            <Button
              fontSize={"0.875rem"}
              variant={"link"}
              onClick={() => router.push("/signup")}
              colorScheme={"secondaryApp"}
              fontWeight={"normal"}
            >
              Clique aqui
            </Button>
          </Text>
        </Flex>
      )}
    </Formik>
  );
}
