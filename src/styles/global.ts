import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { mediaQueries, scrollbar } from "./custom";

const theme = extendTheme({
  components: {
    Button: {
      variants: {
        app: (props) => ({
          height: "2.875rem",
          borderRadius: "0.5rem",
          fontWeight: 500,
          background: "primaryApp.500",
          color: "whiteAlpha.900",
          padding: "0 2rem",
          transition: "filter 0.2s",
          "&:not(:disabled):hover": {
            filter: "brightness(0.9)",
          },
          "&:disabled:hover": {
            background: "primaryApp.500",
            color: "whiteAlpha.900",
          },
        }),
      },
    },
    MenuItem: {
      baseStyle: (props) => ({
        display: "flex",
        alignItems: "center",
        fontWeight: 500,
        height: "auto",
        px: "0.5rem",
        py: "0.7rem",
        grow: 1,
        width: "100%",
        borderRadius: "md",
        justifyContent: "flex-start",
        cursor: "pointer",
        color: mode("primaryApp.500", "primaryApp.200")(props),
        transition: "0.2s",
        _hover: {
          backgroundColor: mode("blackAlpha.200", "whiteAlpha.400")(props),
        },
        border: "1px solid",
        borderColor: "primaryApp.200",
      }),
      variants: {
        active: (props) => ({
          backgroundColor: "primaryApp.100",
          color: "primaryApp.900",
          _hover: {
            backgroundColor: "secondaryApp.100",
            color: "secondaryApp.900",
          },
        }),
      },
    },
  },
  styles: {
    global: (props) => ({
      "#__next": {
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
      },
      html: {
        fontSize: "87.5%",
        scrollBehavior: "smooth",
      },
      a: {
        transition: "color 0.2s",
        color: "complementary.500",
        _hover: {
          color: "complementary.800",
        },
      },
      "*": {
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
      body: {
        background: mode("blackAlpha.100", "blackAlpha.900")(props),
        color: mode("gray.800", "gray.100")(props),
      },
      "body, input, button, select, textarea": {
        fontFamily: "Montserrat, sans-serif",
      },
      ...mediaQueries,
      ...scrollbar,
    }),
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    body: "Karla, sans-serif",
    heading: "Rubik, sans-serif",
    mono: "Fira Mono, monospace",
  },
  colors: {
    primaryApp: {
      50: "#F1E8FC",
      100: "#D6BFF7",
      200: "#BC96F2",
      300: "#A26DEE",
      400: "#8844E9",
      500: "#6E1BE4",
      600: "#5816B6",
      700: "#421089",
      800: "#2C0B5B",
      900: "#16052E",
    },
    secondaryApp: {
      50: "#F8EDF7",
      100: "#EACCE8",
      200: "#DDACD9",
      300: "#D08BCA",
      400: "#C36ABB",
      500: "#B54AAC",
      600: "#913B8A",
      700: "#6D2C67",
      800: "#491D45",
      900: "#240F22",
    },
    tertiaryApp: {
      50: "#FFE6EE",
      100: "#FEB8CF",
      200: "#FE8BB0",
      300: "#FE5D91",
      400: "#FD3072",
      500: "#FD0253",
      600: "#CA0242",
      700: "#980132",
      800: "#650121",
      900: "#330011",
    },
    complementaryApp: {
      50: "#FCF5E8",
      100: "#F7E4BF",
      200: "#F3D396",
      300: "#EEC26D",
      400: "#E9B144",
      500: "#E4A01B",
      600: "#B68016",
      700: "#896010",
      800: "#5B400B",
      900: "#2E2005",
    },
    success: {
      50: "#EAFAEE",
      100: "#C5F1D0",
      200: "#A0E8B1",
      300: "#7BE093",
      400: "#56D774",
      500: "#31CE56",
      600: "#27A545",
      700: "#1D7C33",
      800: "#145222",
      900: "#0A2911",
    },
    warning: {
      50: "#FFF6E6",
      100: "#FEE7B9",
      200: "#FDD78B",
      300: "#FDC85E",
      400: "#FCB831",
      500: "#FCA903",
      600: "#C98703",
      700: "#976502",
      800: "#654301",
      900: "#322201",
    },
    danger: {
      50: "#FBE9EA",
      100: "#F4C2C3",
      200: "#EE9B9D",
      300: "#E77477",
      400: "#E04D51",
      500: "#D9262A",
      600: "#AE1E22",
      700: "#821719",
      800: "#570F11",
      900: "#2B0808",
    },

    google: {
      50: "#FDEAE8",
      100: "#F8C3BE",
      200: "#F49C95",
      300: "#F0756B",
      400: "#EB4F42",
      500: "#E72818",
      600: "#B92013",
      700: "#8B180E",
      800: "#5C100A",
      900: "#2E0805",
    },

    gray: {
      50: "#F1F2F3",
      100: "#D8DCDE",
      200: "#C0C5C9",
      300: "#A7AEB4",
      400: "#8E979F",
      500: "#75818A",
      600: "#5E676E",
      700: "#464D53",
      800: "#2F3337",
      900: "#171A1C",
    },
  },
});

export default theme;
