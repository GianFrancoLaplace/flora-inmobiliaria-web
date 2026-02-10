"use client";

import React, { useState } from "react";
import FiltroToggle from "./FilterButtons";
import styles from "./FilterButtons.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  title: string;
  filters: string[];
  targetPath?: string;
}

const FilterGroup: React.FC<Props> = ({ title, filters, targetPath }) => {
  const [activos, setActivos] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const basePath = targetPath ?? pathname;

  const normalizeForAPI = (value: string): string => {
    const mapping: { [key: string]: string } = {
      Departamentos: "departamento",
      Casas: "casa",
      Lotes: "lote",
      Locales: "local_comercial",
      Campos: "campo",
    };
    return mapping[value] || value.toLowerCase();
  };

  const toggleFiltro = (label: string) => {
    const newActivos = activos.includes(label)
        ? activos.filter((x) => x !== label)
        : [...activos, label];

    setActivos(newActivos);

    const params = new URLSearchParams(searchParams.toString());

    if (newActivos.length > 0) {
      const normalizedValues = newActivos.map(normalizeForAPI);
      params.set("tipo", normalizedValues.join(","));
    } else {
      params.delete("tipo");
    }

    // ✅ manda al listado (home -> /propiedades)
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
      <div className={styles.filterGroupWrapper}>
        <button className={styles.burgerButton} onClick={() => setShowFilters((prev) => !prev)}>
          ☰ Filtrar
        </button>

        {title && <h3 className={styles.filterGroupTitle}>{title}</h3>}

        <div className={`${styles.filterContainer} ${showFilters ? styles.show : ""}`}>
          {filters.map((item) => (
              <FiltroToggle
                  key={item}
                  label={item}
                  isActive={activos.includes(item)}
                  onToggle={() => toggleFiltro(item)}
              />
          ))}
        </div>
      </div>
  );
};

export default FilterGroup;
