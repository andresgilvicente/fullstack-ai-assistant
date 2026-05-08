import Rect from 'react';
import styles from "./styles.module.css";
import Card from "@components/Card/Card";

const InitTemplate = ({ children }) => {
    return (
        <div className={styles.container}>
            <Card>
                {children}
            </Card>
        </div>
    );
}

export default InitTemplate;