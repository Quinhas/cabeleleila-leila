import { Flex, Text, useStyleConfig } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

type MenuItemProps = {
  name: string;
  href: string;
  variant?: string;
};

export default function MenuItem({ variant, name, href }: MenuItemProps) {
  const styles = useStyleConfig("MenuItem", { variant });
  const router = useRouter();

  return (
    <Flex as={"li"} __css={styles} onClick={() => router.push(href)}>
      <Text>{name}</Text>
    </Flex>
  );
}
