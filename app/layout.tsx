'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Encabezado from "./componentes/Encabezado";
import Lateral from "./componentes/Lateral";
import Resultado from "./componentes/resultado";
import { usePathname, useRouter } from "next/navigation";
import { AppStateProvider, useAppState } from "./componentes/acciones/estados";
import Login from "./login/page";
import { ProveedorFiltrosBusqueda } from "./componentes/acciones/filtros";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Movimientos</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ProveedorFiltrosBusqueda>
          <AppStateProvider>
            <LayoutContent>{children}</LayoutContent>
          </AppStateProvider>
        </ProveedorFiltrosBusqueda>
      </body>
    </html>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { state, actions } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  if (!state.estaAutenticado) {
    return (
      <Login
        alIngresar={(user) => {
          actions.login(user); // Guarda el estado en el contexto
          // Si el usuario acaba de iniciar sesión estando en /login, sácalo de ahí
          if (pathname === '/login') {
            router.push('/');
          }
        }}
      />
    );
  }

  // Si ya está autenticado pero la URL dice que sigue en /login, 
  // detenemos que se dibuje todo junto temporalmente mientras el router lo manda al inicio.
  if (pathname === '/login') {
    return null;
  }

  const mostrarResultado = ["/busqueda", "/cargos", "/movimientos", "/familiares"].includes(pathname);

  return (
    <div className={`flex h-screen overflow-hidden bg-[var(--background)] ${state.modoOscuro ? "dark" : ""}`}>
      <Lateral />
      <div className="flex h-screen flex-col overflow-hidden flex-1">
        <Encabezado />
        {mostrarResultado && (
          <aside className="w-full border-b border-[var(--border)] bg-[var(--surface)] overflow-y-auto">
            <Resultado />
          </aside>
        )}
        <main className="flex-1 overflow-y-auto bg-[var(--background)]"> {children} </main>
      </div>
    </div>
  );
}