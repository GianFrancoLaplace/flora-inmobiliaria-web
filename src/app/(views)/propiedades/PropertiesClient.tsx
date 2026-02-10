"use client";

import { useState } from "react";
import styles from "./propertiesstyles.module.css";

import UnifiedFilter from "@/components/FilterPropertiesAdmin/UnifiedFilter";
import SmallCardsGrid from "@/components/SmallCards/SmallCardsGrid";
import type { PropertyWithImages } from "@/types/prisma";

type Props = {
    properties: PropertyWithImages[];
};

export default function PropertiesClient({ properties }: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerRow}>
                        <div>
                            <h1 className={styles.title}>Propiedades</h1>
                            <p className={styles.subtitle}>Encontrá la propiedad ideal en Tandil.</p>
                        </div>

                        <button
                            type="button"
                            className={styles.mobileFilterBtn}
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            Filtros
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                <div className={styles.layout}>
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarSticky}>
                            <div className={styles.sidebarCard}>
                                <div className={styles.sidebarHeader}>
                                    <h2 className={styles.sidebarTitle}>Filtrar</h2>
                                    <p className={styles.sidebarHint}>Se aplica automáticamente.</p>
                                </div>
                                <UnifiedFilter />
                            </div>
                        </div>
                    </aside>

                    <section className={styles.main}>
                        <div className={styles.toolbar}>
                            <div className={styles.resultHint}>Mostrando resultados</div>
                        </div>

                        <SmallCardsGrid properties={properties} />
                    </section>
                </div>
            </div>

            {isDrawerOpen && (
                <div
                    className={styles.drawerOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Filtros"
                    onClick={() => setIsDrawerOpen(false)}
                >
                    <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.drawerTop}>
                            <div>
                                <h2 className={styles.drawerTitle}>Filtros</h2>
                                <p className={styles.drawerHint}>Se aplica automáticamente.</p>
                            </div>

                            <button
                                type="button"
                                className={styles.drawerClose}
                                onClick={() => setIsDrawerOpen(false)}
                                aria-label="Cerrar filtros"
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.drawerBody}>
                            <UnifiedFilter />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
