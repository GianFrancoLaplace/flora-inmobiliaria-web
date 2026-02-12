import styles from "./Us.module.css";
import Image from "next/image";

export default function Us() {
    return (
        <main className={styles.page}>
            {/* Hero */}
            <section className={styles.backgroundNavProperties}>
                <div className={styles.infoImageProperties}>
                    <div className={styles.h5Properties}>
                        <h2>Acerca de nosotros</h2>
                    </div>
                    <h5>Trayectoria | Profesionalismo | Cercanía</h5>
                </div>
            </section>

            {/* Intro + Valores */}
            <section className={styles.aboutSection}>
                <div className={styles.aboutIntro}>
                    <h1 className={styles.sectionTitle}>Un equipo para acompañarte</h1>
                    <p className={styles.sectionText}>
                        En Flora Cordeiro Inmobiliaria trabajamos para que comprar, vender o
                        alquilar sea una experiencia clara y segura. Te asesoramos con
                        información real, pasos simples y acompañamiento de punta a punta.
                    </p>
                </div>

                <div className={styles.valuesGrid}>
                    <article className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Trayectoria</h3>
                        <p className={styles.valueText}>
                            Conocimiento del mercado de Tandil y alrededores, con experiencia
                            en operaciones reales y procesos bien ordenados.
                        </p>
                    </article>

                    <article className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Profesionalismo</h3>
                        <p className={styles.valueText}>
                            Gestión prolija, documentación al día y asesoramiento transparente
                            para que tomes decisiones con confianza.
                        </p>
                    </article>

                    <article className={styles.valueCard}>
                        <h3 className={styles.valueTitle}>Cercanía</h3>
                        <p className={styles.valueText}>
                            Trato humano y seguimiento constante: escuchamos lo que necesitás
                            y te acompañamos en cada etapa.
                        </p>
                    </article>
                </div>
            </section>

            <div className={styles.underline} />

            {/* Mitad imagen / mitad texto */}
            <section className={styles.profileSection}>
                <div className={styles.container}>
                    <div className={styles.imageContainer}>
                        <Image
                            src="/backgrounds/homeBackground.jpg"
                            alt="Retrato de Flora Cordeiro, Martillera Pública"
                            width={450}
                            height={550}
                            className={styles.image}
                            priority
                        />
                    </div>

                    <div className={styles.textContainer}>
                        <h2 className={styles.title}>Flora Cordeiro</h2>
                        <p className={styles.role}>Martillera Pública</p>

                        <p className={styles.description}>
                            Soy Flora. Me apasiona acompañar a las personas a encontrar su
                            hogar o cerrar una operación inmobiliaria de forma segura.
                            <br />
                            <br />
                            Mi objetivo es que todo el proceso sea fácil, claro y una buena
                            experiencia: desde la primera consulta hasta la firma. Trabajamos
                            en equipo para brindarte asesoramiento, negociación y seguimiento
                            en cada paso.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
