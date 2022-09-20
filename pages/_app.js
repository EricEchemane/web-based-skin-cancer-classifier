import '../styles/globals.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: "#a99271",
    },
    secondary: {
      main: "#a99271",
    },
  },
});

function MyApp({ Component, pageProps }) {
  return <ThemeProvider theme={theme}>
    <Component {...pageProps} />
  </ThemeProvider>;
}

export default MyApp;
