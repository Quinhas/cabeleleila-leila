import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Select,
  Text,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "@hooks/useAuth";
import { Field, FieldProps, Form, Formik } from "formik";
import router, { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import InputMask from "react-input-mask";
import { format, add } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { database } from "@services/firebase";
import { FaPlus } from "react-icons/fa";
import { AgendamentoProps, ServiceProps } from "@utils/types";
import { useMemo } from "react";

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

interface SelectedServiceProps extends ServiceProps {
  hour?: string;
}

export default function AgendamentoForm(props: AgendamentoProps) {
  const [availableHours, setAvailableHours] = useState<string[]>(defaultHours);
  const [unavailableHours, setUnavailableHours] = useState<string[]>([]);
  const [previousHour, setPreviousHour] = useState<string>();
  const [loadingAvailableHours, setLoadingAvailableHours] = useState(true);
  const [services, setServices] = useState<ServiceProps[]>([]);
  const [selectedServices, setSelectedServices] = useState<
    SelectedServiceProps[]
  >(props.services ?? []);
  const { user, isAdmin } = useAuth();
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
  });

  const AgendamentoAdminSchema = yup.object().shape({
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
    date: yup.date().required("Campo obrigatório."),
  });

  const handleDateChange = useCallback(
    async (date: string = props.date) => {
      setLoadingAvailableHours(true);
      if (!date || date.trim().length === 0) {
        setAvailableHours(defaultHours);
        setLoadingAvailableHours(false);
        return;
      }
      try {
        const agendamentosRef = database.ref(`/indisponivel/${date}`);
        const firebaseAgendamentos: Record<string, string> = (
          await agendamentosRef.once("value")
        ).val();
        const agendamentos = Object.entries(firebaseAgendamentos ?? []);
        const hours = agendamentos.map(([key, value]) => {
          return {
            hour: `${key}:00`,
            id: value,
          };
        });
        const newAvailableHours = [...defaultHours].filter((hour) => {
          return hours.every((h) => {
            if (h.hour !== hour) {
              return hour;
            }
            if (h.hour === hour) {
              if (h.id === props.id) {
                return hour;
              }
            }
          });
        });
        setAvailableHours(newAvailableHours);
        setLoadingAvailableHours(false);
      } catch (error) {
        toast({
          description: error.message,
          status: "error",
        });
        setLoadingAvailableHours(false);
      }
    },
    [props.date, props.id, toast]
  );

  useEffect(() => {
    if (props.date) {
      handleDateChange(props.date);
    }
  }, [handleDateChange, props.date]);

  const handleServiceClick = (service: ServiceProps) => {
    if (selectedServices.find((selected) => selected.id === service.id)) {
      const newSelected = [...selectedServices].filter((selected) => {
        if (selected.id !== service.id) {
          return selected;
        } else {
          const newUnavailableHours = [...unavailableHours].filter(
            (hour) => hour !== selected.hour
          );
          setUnavailableHours(newUnavailableHours);
        }
      });
      setSelectedServices(newSelected);
    } else {
      const newSelected = [...selectedServices];
      newSelected.push(service);
      setSelectedServices(newSelected);
    }
  };

  const handleHourChange = useCallback(
    (hour: string, service: ServiceProps) => {
      const newUnavailableHours = [...unavailableHours].filter(
        (hour) => hour !== previousHour
      );
      const newServices = selectedServices.map((selected) =>
        selected.id === service.id ? { ...selected, hour: hour } : selected
      );
      setSelectedServices(newServices);
      newUnavailableHours.push(hour);
      setUnavailableHours(newUnavailableHours);
    },
    [previousHour, selectedServices, unavailableHours]
  );

  const initialValues = {
    name: props.name ?? user?.name ?? "",
    phone: props.phone ?? "",
    date: props.date ?? "",
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
        try {
          if (props.id) {
            const agendamentoRef = database.ref(`agendamentos/${props.id}`);
            const newAgendamento = {
              date: values.date,
              hour: selectedServices[0].hour,
              phone: values.phone,
              status: "Pendente",
              services: selectedServices,
              name: values.name,
            };
            await agendamentoRef.update(newAgendamento);
            toast({
              description: "Agendamento atualizado com sucesso.",
              status: "success",
              isClosable: true,
            });
            await router.push("/agendamentos");
            setSelectedServices([]);
            resetForm();
            return;
          }
          const agendamentosRef = database.ref(`agendamentos`);
          const key = agendamentosRef.push().key;
          if (!key) {
            return;
          }
          const newAgendamento = {
            date: values.date,
            hour: selectedServices[0].hour,
            phone: values.phone,
            status: "Pendente",
            id: key,
            clienteId: user?.id,
            name: values.name,
            services: selectedServices,
          };
          await agendamentosRef.child(key).update(newAgendamento);
          const unavailableRef = database.ref(`indisponivel/${values.date}`);
          await Promise.all(
            selectedServices.map(async (value, index) => {
              if (!value.hour) {
                return;
              }
              await unavailableRef
                .child(String(value.hour.split(":")[0]))
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
      validationSchema={isAdmin ? AgendamentoAdminSchema : AgendamentoSchema}
    >
      {({ touched, errors, dirty, isValid, values, isSubmitting }) => (
        <Flex as={Form} gridGap={"1rem"} direction={"column"}>
          <Flex gridGap={"1rem"} w={"100%"}>
            <FormControl
              isRequired
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
              isRequired
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
              isRequired
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
                    min={isAdmin ? '' : format(add(new Date(), { days: 3 }), "yyyy-MM-dd")}
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
          </Flex>

          <Flex gridGap={"0.5rem"}>
            <Text
              fontFamily={"heading"}
              fontWeight={"semibold"}
              fontSize={"1.25rem"}
            >
              Serviços
            </Text>
          </Flex>
          <Flex direction={"column"}>
            {services &&
              services.map((service) => {
                return (
                  <Flex
                    key={service.id}
                    align={"center"}
                    className={"service"}
                    py={"0.5rem"}
                    w={"100%"}
                    justify={"space-between"}
                    css={{
                      "& + .service": {
                        borderTop: "1px solid",
                        borderColor:
                          colorMode === "light"
                            ? "var(--chakra-colors-blackAlpha-300)"
                            : "var(--chakra-colors-whiteAlpha-300)",
                      },
                    }}
                  >
                    <Checkbox
                      grow={1}
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
                      isDisabled={!values.date}
                    >
                      {service.name} - {service.priceFormatted}
                    </Checkbox>
                    {selectedServices.find(
                      (selected) => selected.id === service.id
                    ) && (
                      <FormControl
                        isDisabled={!values.date || loadingAvailableHours}
                        w={"30%"}
                        isRequired
                      >
                        <FormLabel>Horário</FormLabel>
                        <Select
                          type="text"
                          inputMode={"numeric"}
                          borderRadius={"0.5rem"}
                          border={"1px solid"}
                          onFocus={(e) => setPreviousHour(e.target.value)}
                          onChange={(e) =>
                            handleHourChange(e.target.value, service)
                          }
                          defaultValue={
                            selectedServices.find(
                              (selected) => selected.id === service.id
                            )?.hour ?? ""
                          }
                        >
                          <option value="" disabled hidden>
                            Escolher
                          </option>
                          {availableHours?.map((hour) => {
                            return (
                              <option
                                key={hour}
                                value={hour}
                                disabled={
                                  unavailableHours.find(
                                    (uHour) => uHour === hour
                                  )
                                    ? true
                                    : false
                                }
                              >
                                {hour}
                              </option>
                            );
                          })}
                        </Select>
                        {availableHours?.length === 0 && (
                          <FormHelperText
                            color={
                              colorMode === "light" ? "gray.300" : "gray.600"
                            }
                          >
                            Não há horários disponíveis nesse dia.
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Flex>
                );
              })}
          </Flex>
          <Text color={"gray.500"}>
            Total:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(selectedServices.reduce((a, b) => a + b.price, 0))}
          </Text>

          <Button
            type="submit"
            variant={"app"}
            w={"100%"}
            mt={"1rem"}
            isDisabled={
              !isValid ||
              selectedServices.length === 0 ||
              !selectedServices.every((service) => service.hour)
            }
            isLoading={isSubmitting}
          >
            {props.id && "Editar Agendamento"}
            {!props.id && "Agendar"}
          </Button>
        </Flex>
      )}
    </Formik>
  );
}
