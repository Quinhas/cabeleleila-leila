import { Button, Flex, IconButton, useColorMode } from "@chakra-ui/react";
import MenuItem from "@components/MenuItem";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/router";
import React from "react";

export default function Menu() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const pages = [
    { name: "Início", href: "/" },
    { name: "Meus Agendamentos", href: "/agendamentos" },
  ];
  const adminPages = [
    { name: "Painel", href: "/" },
    { name: "Agendamentos", href: "/agendamentos/admin" },
  ];

  return (
    <Flex grow={1}>
      <Flex
        as={"ul"}
        direction={"column"}
        w={"100%"}
        grow={1}
        gridGap={"0.5rem"}
      >
        {!isAdmin &&
          pages.map((page) => (
            <MenuItem
              key={page.href}
              name={page.name}
              href={page.href}
              variant={
                router.pathname.split("/")[1] === page.href.split("/")[1]
                  ? "active"
                  : ""
              }
            />
          ))}
        {isAdmin &&
          adminPages.map((page) => (
            <MenuItem
              key={page.href}
              name={page.name}
              href={page.href}
              variant={
                router.pathname.split("/")[1] === page.href.split("/")[1]
                  ? "active"
                  : ""
              }
            />
          ))}
      </Flex>
    </Flex>
  );
}
