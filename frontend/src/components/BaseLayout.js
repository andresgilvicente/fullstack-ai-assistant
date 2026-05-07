import React from "react";
import styles from "./BaseLayout.module.css";
import Header from "./Header";
import Footer from "./Footer";

export default function BaseLayout({ children }) {
  return (
    // este componente existe para cumplir el layout comun que pide la practica
    // si nos cambian la estructura general de la web seguramente vendremos aqui primero
    <div className={styles.layoutContainer}>
      {/* header comun para todas las pantallas */}
      <Header />
      {/*
        aqui se pinta el contenido variable de cada ruta
        login dashboard chat perfil todo acaba entrando por este hueco
      */}
      <main className={styles.content}>{children}</main>
      {/* footer comun para todas las pantallas */}
      <Footer />
    </div>
  );
}
