import React from "react";
import styles from "./BaseLayout.module.css";
import Header from "./Header";
import Footer from "./Footer";

// Shared page structure: header, route content and footer.
export default function BaseLayout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.content}>{children}</main>
      <Footer />
    </div>
  );
}
