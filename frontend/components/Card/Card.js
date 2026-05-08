import React from "react";
import styles from "./styles.module.css";
const Card = ({ children }) => {
    return (
        <div className={styles.container}>
            {children}
        </div>
    );
}

export default Card;