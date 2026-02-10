"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { OperationEnum, PropertyTypeEnum } from "@/types/prisma";
import FiltroToggle from "../FilterButtons/FilterButtons";
import styles from "./filterPropAdmin.module.css";

const UnifiedFilter: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(false);

	// --- Maps UI -> DB
	const operacionLabels: Record<string, OperationEnum> = useMemo(
		() => ({
			"Quiero comprar": OperationEnum.venta,
			"Quiero alquilar": OperationEnum.alquiler,
		}),
		[]
	);

	const propiedadLabels: Record<string, PropertyTypeEnum> = useMemo(
		() => ({
			Casas: PropertyTypeEnum.casa,
			Departamentos: PropertyTypeEnum.departamento,
			Lotes: PropertyTypeEnum.lote,
		}),
		[]
	);

	// --- Maps DB -> UI
	const operacionLabelsReverse: Record<OperationEnum, string> = useMemo(
		() => ({
			[OperationEnum.venta]: "Quiero comprar",
			[OperationEnum.alquiler]: "Quiero alquilar",
		}),
		[]
	);

	const propiedadLabelsReverse: Record<PropertyTypeEnum, string> = useMemo(
		() => ({
			[PropertyTypeEnum.casa]: "Casas",
			[PropertyTypeEnum.departamento]: "Departamentos",
			[PropertyTypeEnum.lote]: "Lotes",
			[PropertyTypeEnum.campo]: "Campos",
			[PropertyTypeEnum.local_comercial]: "Locales comerciales",
		}),
		[]
	);

	const operacionesEnUrl =
		searchParams.get("operacion")?.split(",").filter(Boolean) || [];
	const tiposEnUrl = searchParams.get("tipo")?.split(",").filter(Boolean) || [];

	const activosOperacion = operacionesEnUrl
		.map((op) => operacionLabelsReverse[op as OperationEnum])
		.filter(Boolean);

	const activosPropiedad = tiposEnUrl
		.map((tp) => propiedadLabelsReverse[tp as PropertyTypeEnum])
		.filter(Boolean);

	const toggleFiltro = (labelUI: string, tipo: "operacion" | "tipo") => {
		const params = new URLSearchParams(searchParams.toString());
		const paramKey = tipo;

		const mapeo = tipo === "operacion" ? operacionLabels : propiedadLabels;
		const valorDB = mapeo[labelUI];
		const currentDB = params.get(paramKey)?.split(",").filter(Boolean) || [];

		const updated = currentDB.includes(valorDB)
			? currentDB.filter((v) => v !== valorDB)
			: [...currentDB, valorDB];

		if (updated.length > 0) params.set(paramKey, updated.join(","));
		else params.delete(paramKey);

		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const handleMaxValueChange = useDebouncedCallback((value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value && value.trim() !== "") params.set("maxValue", value);
		else params.delete("maxValue");

		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	}, 250);

	const clearAll = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("operacion");
		params.delete("tipo");
		params.delete("maxValue");
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	// Lock scroll cuando el drawer está abierto (mobile)
	useEffect(() => {
		if (!isOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [isOpen]);

	const filtrosOperacion = Object.keys(operacionLabels);
	const filtrosPropiedad = Object.keys(propiedadLabels);

	const maxValueDefault = searchParams.get("maxValue") || "";

	return (
		<aside className={styles.sidebar} aria-label="Filtros de propiedades">
			{/* Mobile toolbar */}
			<div className={styles.mobileBar}>
				<button className={styles.openBtn} onClick={() => setIsOpen(true)}>
					☰ Filtrar
				</button>

				<button className={styles.clearBtn} onClick={clearAll} type="button">
					Limpiar
				</button>
			</div>

			{/* Desktop sticky panel */}
			<div className={styles.desktopPanel}>
				<div className={styles.panelHeader}>
					<h3 className={styles.panelTitle}>Filtros</h3>
					<button className={styles.clearBtnInline} onClick={clearAll} type="button">
						Limpiar
					</button>
				</div>

				<div className={styles.section}>
					<label htmlFor="maxValueInputDesktop" className={styles.sectionTitle}>
						Valor máximo
					</label>
					<input
						id="maxValueInputDesktop"
						type="number"
						className={styles.input}
						placeholder="Ej: 120000"
						defaultValue={maxValueDefault}
						onChange={(e) => handleMaxValueChange(e.target.value)}
						min="0"
					/>
				</div>

				<div className={styles.section}>
					<h4 className={styles.sectionTitle}>Operación</h4>
					<div className={styles.toggles}>
						{filtrosOperacion.map((item) => (
							<FiltroToggle
								key={item}
								label={item}
								isActive={activosOperacion.includes(item)}
								onToggle={() => toggleFiltro(item, "operacion")}
							/>
						))}
					</div>
				</div>

				<div className={styles.section}>
					<h4 className={styles.sectionTitle}>Tipo de inmueble</h4>
					<div className={styles.toggles}>
						{filtrosPropiedad.map((item) => (
							<FiltroToggle
								key={item}
								label={item}
								isActive={activosPropiedad.includes(item)}
								onToggle={() => toggleFiltro(item, "tipo")}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Mobile drawer */}
			{isOpen && (
				<div
					className={styles.overlay}
					role="dialog"
					aria-modal="true"
					aria-label="Filtros"
					onClick={() => setIsOpen(false)}
				>
					<div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
						<div className={styles.drawerHeader}>
							<h3 className={styles.panelTitle}>Filtros</h3>
							<button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Cerrar">
								✕
							</button>
						</div>

						<div className={styles.section}>
							<label htmlFor="maxValueInputMobile" className={styles.sectionTitle}>
								Valor máximo
							</label>
							<input
								id="maxValueInputMobile"
								type="number"
								className={styles.input}
								placeholder="Ej: 120000"
								defaultValue={maxValueDefault}
								onChange={(e) => handleMaxValueChange(e.target.value)}
								min="0"
							/>
						</div>

						<div className={styles.section}>
							<h4 className={styles.sectionTitle}>Operación</h4>
							<div className={styles.toggles}>
								{filtrosOperacion.map((item) => (
									<FiltroToggle
										key={item}
										label={item}
										isActive={activosOperacion.includes(item)}
										onToggle={() => toggleFiltro(item, "operacion")}
									/>
								))}
							</div>
						</div>

						<div className={styles.section}>
							<h4 className={styles.sectionTitle}>Tipo de inmueble</h4>
							<div className={styles.toggles}>
								{filtrosPropiedad.map((item) => (
									<FiltroToggle
										key={item}
										label={item}
										isActive={activosPropiedad.includes(item)}
										onToggle={() => toggleFiltro(item, "tipo")}
									/>
								))}
							</div>
						</div>

						<div className={styles.drawerFooter}>
							<button className={styles.clearBtn} onClick={clearAll} type="button">
								Limpiar
							</button>
							<button className={styles.applyBtn} onClick={() => setIsOpen(false)} type="button">
								Ver resultados
							</button>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
};

export default UnifiedFilter;
