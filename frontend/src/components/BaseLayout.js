import React from "react";
import styles from "./BaseLayout.module.css";

export default function BaseLayout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <h1>Agil But Fragile - LLM</h1>
      </header>
      <main className={styles.content}>{children}</main>
      <footer className={styles.footer}>
        <p>&copy; 2026 Agile But Fragile</p>
      </footer>
    </div>
  );
}