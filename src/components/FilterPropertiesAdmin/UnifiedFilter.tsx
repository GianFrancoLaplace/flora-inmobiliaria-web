"use client"

import { useState, useEffect } from 'react';
import styles from './filterPropAdmin.module.css';
import FiltroToggle from '../FilterButtons/FilterButtons';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';

// ✅ SIN PROPS - Todo viene de los enums
const UnifiedFilter: React.FC = () => {
	const [showFilters, setShowFilters] = useState(false);
	const [activosOperacion, setActivosOperacion] = useState<string[]>([]);
	const [activosPropiedad, setActivosPropiedad] = useState<string[]>([]);
	const [maxValue, setMaxValue] = useState<string>('');

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// ✅ Mapeos UI → DB (source of truth: Prisma enums)
	const operacionLabels: Record<string, OperationEnum> = {
		'Quiero comprar': OperationEnum.venta,
		'Quiero alquilar': OperationEnum.alquiler,
	};

	const propiedadLabels: Record<string, PropertyTypeEnum> = {
		'Casas': PropertyTypeEnum.casa,
		'Departamentos': PropertyTypeEnum.departamento,
		'Lotes': PropertyTypeEnum.lote,
	};

	// ✅ Mapeos inversos DB → UI (para leer desde URL)
	const operacionLabelsReverse: Record<OperationEnum, string> = {
		[OperationEnum.venta]: 'Quiero comprar',
		[OperationEnum.alquiler]: 'Quiero alquilar',
	};

	const propiedadLabelsReverse: Record<PropertyTypeEnum, string> = {
		[PropertyTypeEnum.casa]: 'Casas',
		[PropertyTypeEnum.departamento]: 'Departamentos',
		[PropertyTypeEnum.lote]: 'Lotes',
		[PropertyTypeEnum.campo]: 'Campos',
		[PropertyTypeEnum.local_comercial]: 'Locales comerciales',
	};

	// ✅ Leer valores iniciales de URL
	useEffect(() => {
		const operacionParam = searchParams.get('operacion');
		const tipoParam = searchParams.get('tipo');
		const maxValueParam = searchParams.get('maxValue');

		if (operacionParam) {
			const ops = operacionParam
				.split(',')
				.map(op => operacionLabelsReverse[op as OperationEnum])
				.filter(Boolean);
			setActivosOperacion(ops);
		}

		if (tipoParam) {
			const tipos = tipoParam
				.split(',')
				.map(tp => propiedadLabelsReverse[tp as PropertyTypeEnum])
				.filter(Boolean);
			setActivosPropiedad(tipos);
		}

		if (maxValueParam) {
			setMaxValue(maxValueParam);
		}
	}, [searchParams]);

	// ✅ Actualizar URL cuando cambian los filtros
	useEffect(() => {
		const operacionValues = activosOperacion
			.map(op => operacionLabels[op])
			.filter(Boolean);

		const tipoValues = activosPropiedad
			.map(tp => propiedadLabels[tp])
			.filter(Boolean);

		const params = new URLSearchParams();

		if (operacionValues.length > 0) {
			params.set('operacion', operacionValues.join(','));
		}
		if (tipoValues.length > 0) {
			params.set('tipo', tipoValues.join(','));
		}
		if (maxValue && maxValue.trim() !== '') {
			params.set('maxValue', maxValue);
		}

		const newUrl = `${pathname}?${params.toString()}`;
		window.history.replaceState(null, '', newUrl);
	}, [activosOperacion, activosPropiedad, maxValue, pathname]);

	const toggleFiltro = (
		label: string,
		activos: string[],
		setActivos: React.Dispatch<React.SetStateAction<string[]>>
	) => {
		setActivos((prev) =>
			prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
		);
	};

	const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMaxValue(e.target.value);
	};

	// ✅ Arrays derivados de los mapeos (no hardcodeados)
	const filtrosOperacion = Object.keys(operacionLabels);
	const filtrosPropiedad = Object.keys(propiedadLabels);

	return (
		<div className={styles.unifiedFilterWrapper}>
			<button className={styles.burgerButton} onClick={() => setShowFilters((prev) => !prev)}>
				☰ Filtrar
			</button>

			<div
				className={`${styles.filterContainer} ${styles.vertical} ${
					showFilters ? styles.show : ''
				}`}
			>
				<div className={styles.flexCol}>
					<label htmlFor="maxValueInput" className={styles.filterSectionTitle}>
						Valor máximo
					</label>
					<div className={styles.inputWithSearchContainer}>
						<input
							id="maxValueInput"
							type="number"
							className={styles.maxValueInput}
							placeholder="Escribe el valor máximo"
							value={maxValue}
							onChange={handleMaxValueChange}
							min="0"
						/>
						<button className={styles.searchButton} type="button">
							<img
								src="/icons/search.png"
								alt="Buscar"
								className={styles.searchIcon}
							/>
						</button>
					</div>
				</div>

				<div className={styles.flexCol}>
					<h3>Filtrar por operación</h3>
					{filtrosOperacion.map((item) => (
						<FiltroToggle
							key={item}
							label={item}
							isActive={activosOperacion.includes(item)}
							onToggle={() => toggleFiltro(item, activosOperacion, setActivosOperacion)}
						/>
					))}
				</div>

				<div className={styles.flexCol}>
					<h3>Filtrar por inmueble</h3>
					{filtrosPropiedad.map((item) => (
						<FiltroToggle
							key={item}
							label={item}
							isActive={activosPropiedad.includes(item)}
							onToggle={() => toggleFiltro(item, activosPropiedad, setActivosPropiedad)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default UnifiedFilter;