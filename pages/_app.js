import 'tailwindcss/tailwind.css'; // Importe o CSS global do Tailwind CSS

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
