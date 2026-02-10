"use client";

import styles from "./ContactInformation.module.css";

export default function ContactInformation() {
    return (
        <div className={styles.strip}>
            <div className={styles.marquee}>
                <div className={styles.track}>
                    <span>@floracordeiro_inmobiliaria</span>
                    <span className={styles.sep}>•</span>
                    <span>floracordeiroinmobiliaria@gmail.com</span>
                    <span className={styles.sep}>•</span>
                    <span>2494 20-8037</span>

                    {/* duplicado para loop */}
                    <span className={styles.sep}>•</span>
                    <span>@floracordeiro_inmobiliaria</span>
                    <span className={styles.sep}>•</span>
                    <span>floracordeiroinmobiliaria@gmail.com</span>
                    <span className={styles.sep}>•</span>
                    <span>2494 20-8037</span>
                </div>
            </div>
        </div>
    );
}
