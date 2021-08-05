import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@hooks/useAuth";
import { Field, FieldProps, Form, Formik } from "formik";
import router, { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import * as yup from "yup";
import InputMask from "react-input-mask";
import { format, add } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { database } from "@services/firebase";

type CreateAgendamentoFormProps = {
  name?: string;
  phone?: string;
  date?: string;
  hour?: string;
};

type ServiceProps = {
  name: string;
  desc: string;
  price: number;
  priceFormatted: string;
  id: string;
};

const defaultHours = [
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function CreateAgendamentoForm(
  props: CreateAgendamentoFormProps
) {
  const [availableHours, setAvailableHours] = useState<string[]>(defaultHours);
  const [loadingAvailableHours, setLoadingAvailableHours] = useState(true);
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceProps[]>([]);
  const { user } = useAuth();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const router = useRouter();

  useEffect(() => {
    const servicesRef = database.ref(`servicos`);
    servicesRef.on("value", (snap) => {
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

    return () => {
      servicesRef.off("value");
    };
  }, []);

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
        add(new Date(), { days: 2 }),
        `A data de início deve ser depois de ${format(
          add(new Date(), { days: 2 }),
          "P",
          {
            locale: ptBR,
          }
        )}`
      )
      .required("Campo obrigatório."),
    hour: yup.string().required("Campo obrigatório."),
  });

  const handleDateChange = async (date: string) => {
    setLoadingAvailableHours(true);
    if (!date || date.trim().length === 0) {
      setAvailableHours(defaultHours);
      setLoadingAvailableHours(false);
      return;
    }
    try {
      const agendamentosRef = database.ref(`/indisponivel/${date}`);
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
      const hours = agendamentos.map(([key]) => {
        return `${key}:00`;
      });
      const newAvailableHours = [...defaultHours].filter(
        (hour) => !hours.includes(hour)
      );
      setAvailableHours(newAvailableHours);
      setLoadingAvailableHours(false);
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
      });
      setLoadingAvailableHours(false);
    }
  };

  const handleServiceClick = (service: ServiceProps) => {
    if (selectedServices.includes(service)) {
      const newSelected = [...selectedServices].filter(
        (selected) => selected.id !== service.id
      );
      setSelectedServices(newSelected);
    } else {
      const newSelected = [...selectedServices];
      newSelected.push(service);
      setSelectedServices(newSelected);
    }
  };

  const initialValues = {
    name: props.name ?? user?.name ?? "",
    phone: props.phone ?? "",
    date: props.date ?? "",
    hour: props.hour ?? availableHours[0] ?? "",
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
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
            services: selectedServices,
          };
          await agendamentosRef.child(key).update(newAgendamento);
          const unavailableRef = database.ref(`indisponivel/${values.date}`);
          const selectedHour = Number(values.hour.split(":")[0]);
          await Promise.all(
            selectedServices.map(async (value, index) => {
              await unavailableRef
                .child(String(selectedHour + index))
                .set(user?.id);
            })
          );
          toast({
            description: "Agendamento marcado com sucesso.",
            status: "success",
            isClosable: true,
          });
          await router.push("/agendamentos");
          setSelectedServices([]);
          resetForm();
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
                    min={format(add(new Date(), { days: 3 }), "yyyy-MM-dd")}
                    h={"2.875rem"}
                    borderRadius={"0.5rem"}
                    p={"0 1rem"}
                    border={"1px solid"}
                    onBlur={(e) => {
                      field.onBlur(e);
                      handleDateChange(values.date);
                    }}
                  />
                )}
              </Field>

              <FormErrorMessage>{errors.date}</FormErrorMessage>
            </FormControl>

            <FormControl
              isDisabled={!values.date || loadingAvailableHours}
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

          <Text
            fontFamily={"heading"}
            fontWeight={"semibold"}
            fontSize={"1.25rem"}
          >
            Serviços
          </Text>
          <Flex wrap={"wrap"} gridRowGap={"0.5rem"}>
            {services &&
              services.map((service) => {
                return (
                  <Checkbox
                    key={service.id}
                    w={"50%"}
                    onChange={() => handleServiceClick(service)}
                    isChecked={
                      selectedServices.find(
                        (selected) => selected.id === service.id
                      )
                        ? true
                        : false
                    }
                    defaultIsChecked={
                      selectedServices.find(
                        (selected) => selected.id === service.id
                      )
                        ? true
                        : false
                    }
                  >
                    {service.name} - {service.priceFormatted}
                  </Checkbox>
                );
              })}
          </Flex>
          <Text fontSize={"0.875rem"} color={"gray.500"}>
            Cada serviço possui tempo médio de 1 hora.
          </Text>

          <Button
            type="submit"
            variant={"app"}
            w={"100%"}
            mt={"1rem"}
            isDisabled={!dirty || !isValid || selectedServices.length === 0}
            isLoading={isSubmitting}
          >
            Agendar
          </Button>
        </Flex>
      )}
    </Formik>
  );
}
