import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@hooks/useAuth";
import { Field, FieldProps, Form, Formik } from "formik";
import router from "next/router";
import React, { useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import * as yup from "yup";
import InputMask from "react-input-mask";
import { format, sub } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { database } from "@services/firebase";

type CreateAgendamentoFormProps = {
  name?: string;
  phone?: string;
  date?: string;
  hour?: string;
};

const defaultHours = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function CreateAgendamentoForm(
  props: CreateAgendamentoFormProps
) {
  const [availableHours, setAvailableHours] = useState<string[]>(defaultHours);
  const { user } = useAuth();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const AgendamentoSchema = yup.object().shape({
    name: yup.string().required("Campo obrigatório."),
    phone: yup
      .string()
      .required("Campo obrigatório.")
      .test("isValid", "Telefone inválido", (value, context) => {
        if (!value || value.replace(/\D/g, "").length < 11) {
          return false;
        } else {
          return true;
        }
      }),
    date: yup
      .date()
      .min(
        sub(new Date(), { days: 1 }),
        `A data de início deve ser depois de ${format(
          sub(new Date(), { days: 1 }),
          "P",
          {
            locale: ptBR,
          }
        )}`
      )
      .required("Campo obrigatório."),
  });

  const handleDateChange = async (date: string) => {
    if (!date || date.trim().length === 0) {
      setAvailableHours(defaultHours);
      return;
    }
    try {
      const agendamentosRef = database
        .ref(`/agendamentos`)
        .orderByChild("date")
        .equalTo(date);
      const firebaseAgendamentos: Record<
        string,
        {
          date: string;
          hour: string;
          phone: string;
          status: string;
          id: string;
        }
      > = (await agendamentosRef.once("value")).val();
      const agendamentos = Object.entries(firebaseAgendamentos ?? []);
      console.log(agendamentos);
      const hours = agendamentos.map(([key, agendamento]) => {
        return agendamento.hour;
      });
      const newAvailableHours = [...defaultHours].filter(
        (hour) => !hours.includes(hour)
      );
      setAvailableHours(newAvailableHours);
    } catch (error) {}
  };

  const initialValues = {
    name: props.name ?? user?.name ?? "",
    phone: props.phone ?? "",
    date: props.date ?? "",
    hour: props.hour ?? "",
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        try {
          const agendamentosRef = database.ref(`agendamentos`);
          const key = agendamentosRef.push().key;
          if (!key) {
            return;
          }
          const newAgendamento = {
            date: values.date,
            hour: values.hour,
            phone: values.phone,
            status: "Pendente",
            id: key,
            clienteId: user?.id,
          };
          agendamentosRef.child(key).update(newAgendamento);
          toast({
            description: "Agendamento marcado com sucesso.",
            status: "success",
            isClosable: true,
          });
        } catch (error) {
          toast({
            description: error.message,
            status: "error",
            isClosable: true,
            duration: 9000,
          });
        }
      }}
      validationSchema={AgendamentoSchema}
    >
      {({ touched, errors, dirty, isValid, values, isSubmitting }) => (
        <Flex as={Form} gridGap={"1rem"} direction={"column"}>
          <Flex gridGap={"1rem"} w={"100%"}>
            <FormControl
              isInvalid={errors.name && touched.name ? true : false}
              w={"50%"}
            >
              <FormLabel>Nome do Cliente</FormLabel>
              <Field name={"name"}>
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Nome do Cliente"
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
              isInvalid={errors.phone && touched.phone ? true : false}
              w={"50%"}
            >
              <FormLabel>Telefone do Cliente</FormLabel>
              <Field name={"phone"}>
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    as={InputMask}
                    mask={"(99) 99999-9999"}
                    type="text"
                    inputMode={"numeric"}
                    placeholder="Telefone do Cliente"
                    h={"2.875rem"}
                    borderRadius={"0.5rem"}
                    p={"0 1rem"}
                    border={"1px solid"}
                  />
                )}
              </Field>

              <FormErrorMessage>{errors.phone}</FormErrorMessage>
            </FormControl>
          </Flex>

          <Flex gridGap={"1rem"} w={"100%"}>
            <FormControl
              isInvalid={errors.date && touched.date ? true : false}
              w={"50%"}
            >
              <FormLabel>Data</FormLabel>
              <Field name={"date"}>
                {({ field }: FieldProps) => (
                  <Input
                    {...field}
                    type="date"
                    placeholder="Data do Atendimento"
                    min={format(new Date(), "yyyy-MM-dd")}
                    h={"2.875rem"}
                    borderRadius={"0.5rem"}
                    p={"0 1rem"}
                    border={"1px solid"}
                    onBlur={() => handleDateChange(values.date)}
                  />
                )}
              </Field>

              <FormErrorMessage>{errors.date}</FormErrorMessage>
            </FormControl>

            <FormControl
              isDisabled={!values.date}
              isInvalid={errors.hour && touched.hour ? true : false}
              w={"50%"}
            >
              <FormLabel>Horário</FormLabel>
              <Field name={"hour"}>
                {({ field }: FieldProps) => (
                  <Select
                    {...field}
                    type="text"
                    inputMode={"numeric"}
                    h={"2.875rem"}
                    borderRadius={"0.5rem"}
                    border={"1px solid"}
                  >
                    {availableHours?.map((hour) => {
                      return (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      );
                    })}
                  </Select>
                )}
              </Field>

              <FormErrorMessage>{errors.hour}</FormErrorMessage>
              {!values.date && (
                <FormHelperText
                  color={colorMode === "light" ? "gray.300" : "gray.600"}
                >
                  Preencha a data primeiro.
                </FormHelperText>
              )}
              {values.date && availableHours?.length === 0 && (
                <FormHelperText
                  color={colorMode === "light" ? "gray.300" : "gray.600"}
                >
                  Não há horários disponíveis nesse dia.
                </FormHelperText>
              )}
            </FormControl>
          </Flex>

          <Button
            type="submit"
            variant={"app"}
            w={"100%"}
            mt={"1rem"}
            isDisabled={!dirty || !isValid}
            isLoading={isSubmitting}
          >
            Agendar
          </Button>
        </Flex>
      )}
    </Formik>
  );
}
