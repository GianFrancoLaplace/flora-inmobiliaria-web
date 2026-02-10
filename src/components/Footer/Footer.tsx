import styles from "./Footer.module.css";
import Link from "next/link";
import Image from "next/image";
import {
    Instagram,
    Facebook,
    Mail,
    MapPin,
    Phone,
    Building2,
    Info,
    ArrowRight,
} from "lucide-react";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                {/* Marca */}
                <div className={styles.brand}>
                    <Link href="/" className={styles.brandLink} aria-label="Ir al inicio">
                        <Image
                            src="/logos/footerLogo.png" // ajustá si tu logo está en otra ruta
                            alt="Flora Cordeiro Inmobiliaria"
                            width={180}
                            height={110}
                            className={styles.logo}
                        />
                    </Link>

                    <p className={styles.tagline}>
                        Negocios inmobiliarios en Tandil. Atención cercana y acompañamiento en
                        cada paso.
                    </p>

                    <Link href="/propiedades" className={styles.primaryCta}>
                        Ver propiedades <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Propiedades */}
                <nav className={styles.section}>
                    <h3 className={styles.title}>
                        <Building2 size={16} /> Propiedades
                    </h3>

                    <ul className={styles.list}>
                        <li>
                            <Link className={styles.link} href="/propiedades">
                                Ver todas
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={styles.link}
                                href="/propiedades?operacion=venta"
                            >
                                En venta
                            </Link>
                        </li>
                        <li>
                            <Link
                                className={styles.link}
                                href="/propiedades?operacion=alquiler"
                            >
                                En alquiler
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Sobre nosotros */}
                <nav className={styles.section}>
                    <h3 className={styles.title}>
                        <Info size={16} /> Sobre nosotros
                    </h3>

                    <ul className={styles.list}>
                        <li>
                            <Link className={styles.link} href="/nosotros">
                                Información
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Contacto */}
                <div className={styles.section}>
                    <h3 className={styles.title}>Contacto</h3>

                    <ul className={styles.list}>
                        <li>
                            <a
                                className={styles.item}
                                href="https://wa.me/2494208037"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Phone size={16} />
                                <span>2494 20-8037</span>
                            </a>
                        </li>

                        <li>
                            <a
                                className={styles.item}
                                href="mailto:floracordeiroinmobiliaria@gmail.com"
                            >
                                <Mail size={16} />
                                <span>floracordeiroinmobiliaria@gmail.com</span>
                            </a>
                        </li>

                        <li>
                            <a
                                className={styles.item}
                                href="https://www.google.com/maps/search/?api=1&query=14+de+Julio+796+Tandil"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MapPin size={16} />
                                <span>14 de Julio 796, Tandil</span>
                            </a>
                        </li>
                    </ul>

                    <div className={styles.socials}>
                        <a
                            className={styles.social}
                            href="https://instagram.com/floracordeiro_inmobiliaria"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <Instagram size={18} />
                        </a>

                        <a
                            className={styles.social}
                            href="https://facebook.com/inmob.flora.cordeiro"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <Facebook size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className={styles.bottom}>
                <p className={styles.copy}>
                    © {new Date().getFullYear()} Flora Cordeiro Inmobiliaria
                </p>

                <span className={styles.madeBy}>Made by Magno IT Systems</span>
            </div>
        </footer>
    );
}
