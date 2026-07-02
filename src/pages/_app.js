import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { RouteGuard } from "../../router/RouteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full flex flex-col`}>
      <RouteGuard>
        <Component {...pageProps} />
      </RouteGuard>
    </div>
  );
}
