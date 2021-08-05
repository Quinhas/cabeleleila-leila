import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  toast,
  useToast,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Text,
} from "@chakra-ui/react";
import { database } from "@services/firebase";
import { Formik, Form, Field, FieldProps } from "formik";
import React, { useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import * as yup from "yup";

type ModalServiceProps = {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  desc?: string;
  price?: number;
  id?: string;
};

export default function ModalService({
  isOpen,
  onClose,
  name,
  desc,
  price,
  id,
}: ModalServiceProps) {
  const toast = useToast();
  const {
    isOpen: confirmIsOpen,
    onOpen: confirmOnOpen,
    onClose: confirmOnClose,
  } = useDisclosure();
  const cancelRef = useRef(null);

  const ServiceSchema = yup.object().shape({
    name: yup.string().required("Campo obrigatório."),
    desc: yup
      .string()
      .required("Campo obrigatório.")
      .test(
        "length",
        "A descrição deve ter no máximo 200 caracteres",
        (value, context) => {
          if (!value || value.trim().length === 0) {
            return true;
          }
          if (value.length > 200) {
            return false;
          }
          return true;
        }
      ),
    price: yup
      .number()
      .required("Campo obrigatório.")
      .min(0, "Preço deve ser maior ou igual a 0"),
  });

  const initialValues = {
    name: name ?? "",
    desc: desc ?? "",
    price: price ?? "",
  };

  const handleDelete = async () => {
    const serviceRef = database.ref(`servicos/${id}`);
    try {
      await serviceRef.remove();
      toast({
        description: "Serviço excluído com sucesso!",
        status: "success",
      });
      onClose();
      confirmOnClose();
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{id ? "Atualizar" : "Cadastrar"} Serviço</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Formik
              initialValues={initialValues}
              onSubmit={async (values, { resetForm }) => {
                try {
                  if (id) {
                    const serviceRef = database.ref(`servicos/${id}`);
                    serviceRef.update({
                      desc: values.desc,
                      name: values.name,
                      price: values.price,
                    });
                    toast({
                      description: "Serviço atualizado com sucesso.",
                      status: "success",
                      isClosable: true,
                    });
                    resetForm();
                    onClose();
                    return;
                  }
                  const servicesRef = database.ref(`servicos`);
                  const key = (await servicesRef.push()).key;
                  if (!key) {
                    return;
                  }
                  servicesRef.child(key).set({
                    desc: values.desc,
                    name: values.name,
                    price: values.price,
                    id: key,
                  });
                  toast({
                    description: "Serviço criado com sucesso.",
                    status: "success",
                    isClosable: true,
                  });
                  resetForm();
                  onClose();
                } catch (error) {
                  toast({
                    description: error.message,
                    status: "error",
                    isClosable: true,
                    duration: 9000,
                  });
                }
              }}
              validationSchema={ServiceSchema}
            >
              {({ touched, errors, dirty, isValid, values, isSubmitting }) => (
                <Flex as={Form} gridGap={"1rem"} direction={"column"}>
                  <Flex gridGap={"1rem"} w={"100%"}>
                    <FormControl
                      isInvalid={errors.name && touched.name ? true : false}
                      w={"50%"}
                    >
                      <FormLabel>Nome do Serviço</FormLabel>
                      <Field name={"name"}>
                        {({ field }: FieldProps) => (
                          <Input
                            {...field}
                            type="text"
                            placeholder="Nome do Serviço"
                            h={"2.875rem"}
                            borderRadius={"0.5rem"}
                            p={"0 1rem"}
                            border={"1px solid"}
                          />
                        )}
                      </Field>

                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    </FormControl>

                    <FormControl
                      isInvalid={errors.price && touched.price ? true : false}
                      w={"50%"}
                    >
                      <FormLabel>Preço</FormLabel>
                      <Field name={"price"}>
                        {({ field }: FieldProps) => (
                          <Input
                            {...field}
                            type="number"
                            placeholder="Preço"
                            inputMode={"numeric"}
                            step="any"
                            min={0}
                            h={"2.875rem"}
                            borderRadius={"0.5rem"}
                            p={"0 1rem"}
                            border={"1px solid"}
                          />
                        )}
                      </Field>

                      <FormErrorMessage>{errors.price}</FormErrorMessage>
                    </FormControl>
                  </Flex>

                  <Flex gridGap={"1rem"} w={"100%"}>
                    <FormControl
                      isInvalid={errors.desc && touched.desc ? true : false}
                    >
                      <FormLabel>Descrição do Serviço</FormLabel>
                      <Field name={"desc"}>
                        {({ field }: FieldProps) => (
                          <Textarea
                            {...field}
                            type="text"
                            placeholder="Descrição"
                            h={"7.875rem"}
                            maxLength={200}
                            borderRadius={"0.5rem"}
                            border={"1px solid"}
                          />
                        )}
                      </Field>

                      <FormErrorMessage>{errors.desc}</FormErrorMessage>
                    </FormControl>
                  </Flex>

                  <Flex as={ModalFooter} px={0} grow={1} justify={"start"}>
                    {id && (
                      <Flex>
                        <IconButton
                          aria-label={"Excluir"}
                          icon={<FaTrashAlt />}
                          variant={"ghost"}
                          colorScheme={"danger"}
                          onClick={confirmOnOpen}
                        />
                      </Flex>
                    )}
                    <Flex gridGap={"0.5rem"} ms={"auto"}>
                      <Button colorScheme="gray" onClick={onClose}>
                        Fechar
                      </Button>
                      <Button
                        type="submit"
                        isDisabled={!dirty || !isValid}
                        isLoading={isSubmitting}
                        colorScheme={"primaryApp"}
                      >
                        {id ? "Atualizar" : "Cadastrar"}
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </Formik>
          </ModalBody>
        </ModalContent>
      </Modal>
      {id && (
        <AlertDialog
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={confirmOnClose}
          isOpen={confirmIsOpen}
        >
          <AlertDialogOverlay />

          <AlertDialogContent>
            <AlertDialogHeader>Excluir serviço?</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              Tem certeza de que deseja excluir o serviço{" "}
              <Text fontWeight={"semibold"} as={"span"}>
                {name}
              </Text>
              ?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="danger" ml={3} onClick={handleDelete}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
