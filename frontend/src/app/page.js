"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  // esta ruta raiz no enseña nada real, solo decide a donde mandamos al usuario
  const router = useRouter();

  useEffect(() => {
    // aqui miramos si en localstorage ya tenemos el accesstoken guardado
    // si quisieramos cambiar como persistimos la sesion habria que mirar
    // este fichero y tambien authcontext
    const token = localStorage.getItem("accessToken");

    if (token) {
      // si ya habia sesion mandamos al dashboard
      router.push("/dashboard");
    } else {
      // si no hay sesion empezamos por login
      router.push("/login");
    }
  }, [router]);

  return (
    <div>
      {/* mientras decidimos la redireccion enseñamos algo minimo */}
      <p>Cargando...</p>
    </div>
  );
}
