"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

import { CurrencyEnum, OperationEnum, PropertyTypeEnum } from "@/types/prisma";
import FiltroToggle from "../FilterButtons/FilterButtons";
import styles from "./filterPropAdmin.module.css";

const MAX_PRICE_FILTER = 2_147_483_647;

const formatWithThousands = (digits: string): string => {
	if (!digits) return "";
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const UnifiedFilter: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [isOpen, setIsOpen] = useState(false);
	const maxValueParam = searchParams.get("maxValue") || "";
	const [maxValueInput, setMaxValueInput] = useState(maxValueParam);

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
			Locales: ((PropertyTypeEnum as unknown as Record<string, string>).local ??
				PropertyTypeEnum.local_comercial) as PropertyTypeEnum,
		}),
		[]
	);

	const operacionLabelsReverse: Record<OperationEnum, string> = useMemo(
		() => ({
			[OperationEnum.venta]: "Quiero comprar",
			[OperationEnum.alquiler]: "Quiero alquilar",
		}),
		[]
	);

	const propiedadLabelsReverse: Record<string, string> = useMemo(() => {
		const enumValues = PropertyTypeEnum as unknown as Record<string, string>;

		return {
			[PropertyTypeEnum.casa]: "Casas",
			[PropertyTypeEnum.departamento]: "Departamentos",
			[PropertyTypeEnum.lote]: "Lotes",
			[PropertyTypeEnum.campo]: "Campos",
			[PropertyTypeEnum.local_comercial]: "Locales",
			...(enumValues.local ? { [enumValues.local]: "Locales" } : {}),
		};
	}, []);

	const operacionesEnUrl = searchParams.get("operacion")?.split(",").filter(Boolean) || [];
	const tiposEnUrl = searchParams.get("tipo")?.split(",").filter(Boolean) || [];
	const selectedCurrency = (searchParams.get("currency") as CurrencyEnum | null) ?? CurrencyEnum.USD;

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

	const handleMaxValueInputChange = (rawValue: string) => {
		const onlyDigits = rawValue.replace(/\D/g, "");
		if (!onlyDigits) {
			setMaxValueInput("");
			handleMaxValueChange("");
			return;
		}

		const safeValue = String(Math.min(Number(onlyDigits), MAX_PRICE_FILTER));
		setMaxValueInput(safeValue);
		handleMaxValueChange(safeValue);
	};

	const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const allowedKeys = new Set([
			"Backspace",
			"Delete",
			"ArrowLeft",
			"ArrowRight",
			"Tab",
			"Home",
			"End",
		]);

		if (e.ctrlKey || e.metaKey) return;
		if (allowedKeys.has(e.key)) return;
		if (/^\d$/.test(e.key)) return;

		e.preventDefault();
	};

	const handleCurrencyChange = (currency: CurrencyEnum) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("currency", currency);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	const clearAll = () => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("operacion");
		params.delete("tipo");
		params.delete("maxValue");
		params.delete("currency");
		setMaxValueInput("");
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	useEffect(() => {
		if (!isOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [isOpen]);

	useEffect(() => {
		const raw = maxValueParam.replace(/\D/g, "");
		if (!raw) {
			setMaxValueInput("");
			return;
		}
		setMaxValueInput(String(Math.min(Number(raw), MAX_PRICE_FILTER)));
	}, [maxValueParam]);

	const filtrosOperacion = Object.keys(operacionLabels);
	const filtrosPropiedad = Object.keys(propiedadLabels);
	return (
		<aside className={styles.sidebar} aria-label="Filtros de propiedades">
			<div className={styles.mobileBar}>
				<button className={styles.openBtn} onClick={() => setIsOpen(true)}>
					Filtrar
				</button>
				<button className={styles.clearBtn} onClick={clearAll} type="button">
					Limpiar
				</button>
			</div>

			<div className={styles.desktopPanel}>
				<div className={styles.panelHeader}>
					<h3 className={styles.panelTitle}>Filtros</h3>
					<button className={styles.clearBtnInline} onClick={clearAll} type="button">
						Limpiar
					</button>
				</div>

				<div className={styles.section}>
					<h4 className={styles.sectionTitle}>Moneda</h4>
					<div className={styles.togglesRow}>
						<FiltroToggle
							label="USD"
							isActive={selectedCurrency === CurrencyEnum.USD}
							onToggle={() => handleCurrencyChange(CurrencyEnum.USD)}
						/>
						<FiltroToggle
							label="ARS"
							isActive={selectedCurrency === CurrencyEnum.ARS}
							onToggle={() => handleCurrencyChange(CurrencyEnum.ARS)}
						/>
					</div>
				</div>

				<div className={styles.section}>
					<label htmlFor="maxValueInputDesktop" className={styles.sectionTitle}>
						Valor maximo ({selectedCurrency})
					</label>
					<input
						id="maxValueInputDesktop"
						type="text"
						className={styles.input}
						placeholder="Ej: 120000"
						value={formatWithThousands(maxValueInput)}
						inputMode="numeric"
						pattern="[0-9]*"
						onKeyDown={handleNumericKeyDown}
						onChange={(e) => handleMaxValueInputChange(e.target.value)}
					/>
				</div>

				<div className={styles.section}>
					<h4 className={styles.sectionTitle}>Operacion</h4>
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
								x
							</button>
						</div>

						<div className={styles.section}>
							<h4 className={styles.sectionTitle}>Moneda</h4>
							<div className={styles.togglesRow}>
								<FiltroToggle
									label="USD"
									isActive={selectedCurrency === CurrencyEnum.USD}
									onToggle={() => handleCurrencyChange(CurrencyEnum.USD)}
								/>
								<FiltroToggle
									label="ARS"
									isActive={selectedCurrency === CurrencyEnum.ARS}
									onToggle={() => handleCurrencyChange(CurrencyEnum.ARS)}
								/>
							</div>
						</div>

						<div className={styles.section}>
							<label htmlFor="maxValueInputMobile" className={styles.sectionTitle}>
								Valor maximo ({selectedCurrency})
							</label>
							<input
								id="maxValueInputMobile"
								type="text"
								className={styles.input}
								placeholder="Ej: 120000"
								value={formatWithThousands(maxValueInput)}
								inputMode="numeric"
								pattern="[0-9]*"
								onKeyDown={handleNumericKeyDown}
								onChange={(e) => handleMaxValueInputChange(e.target.value)}
							/>
						</div>

						<div className={styles.section}>
							<h4 className={styles.sectionTitle}>Operacion</h4>
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
