import styles from "@/components/Home/Home.module.css";

export default function Home() {
    return (
        <section className={styles.hero} aria-label="Bienvenida">
            <div className={styles.overlay} />

            <div className={styles.content}>
                <p className={styles.kicker}>Flora Cordeiro</p>

                <h1 className={styles.title}>
                    Negocios inmobiliarios
                    <br />
                    <span className={styles.highlight}>con cercanía y transparencia</span>
                </h1>

                <p className={styles.subtitle}>
	                Asesoramiento personalizado en compra, venta y alquiler en Tandil.
                </p>
            </div>
        </section>
    );
}
