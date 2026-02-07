"use client"

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PropertyTypeEnum, OperationEnum } from '@/types/prisma';
import FiltroToggle from '../FilterButtons/FilterButtons';
import styles from './filterPropAdmin.module.css';
import { useState } from 'react';

const UnifiedFilter: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const [showFilters, setShowFilters] = useState(false);

	const operacionLabels: Record<string, OperationEnum> = {
		'Quiero comprar': OperationEnum.venta,
		'Quiero alquilar': OperationEnum.alquiler,
	};

	const propiedadLabels: Record<string, PropertyTypeEnum> = {
		'Casas': PropertyTypeEnum.casa,
		'Departamentos': PropertyTypeEnum.departamento,
		'Lotes': PropertyTypeEnum.lote,
	};

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

	const operacionesEnUrl = searchParams.get('operacion')?.split(',').filter(Boolean) || [];
	const tiposEnUrl = searchParams.get('tipo')?.split(',').filter(Boolean) || [];

	const activosOperacion = operacionesEnUrl
		.map(op => operacionLabelsReverse[op as OperationEnum])
		.filter(Boolean);

	const activosPropiedad = tiposEnUrl
		.map(tp => propiedadLabelsReverse[tp as PropertyTypeEnum])
		.filter(Boolean);

	const toggleFiltro = (labelUI: string, tipo: 'operacion' | 'tipo') => {
		const params = new URLSearchParams(searchParams.toString());
		const paramKey = tipo;
		const mapeo = tipo === 'operacion' ? operacionLabels : propiedadLabels;

		const valorDB = mapeo[labelUI];
		const currentDB = params.get(paramKey)?.split(',').filter(Boolean) || [];

		const updated = currentDB.includes(valorDB)
			? currentDB.filter(v => v !== valorDB)
			: [...currentDB, valorDB];

		if (updated.length > 0) {
			params.set(paramKey, updated.join(','));
		} else {
			params.delete(paramKey);
		}

		router.push(`${pathname}?${params.toString()}`);
	};

	const handleMaxValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const params = new URLSearchParams(searchParams.toString());

		if (e.target.value && e.target.value.trim() !== '') {
			params.set('maxValue', e.target.value);
		} else {
			params.delete('maxValue');
		}

		router.push(`${pathname}?${params.toString()}`);
	};

	const filtrosOperacion = Object.keys(operacionLabels);
	const filtrosPropiedad = Object.keys(propiedadLabels);

	return (
		<div className={styles.unifiedFilterWrapper}>
			<button
				className={styles.burgerButton}
				onClick={() => setShowFilters((prev) => !prev)}
			>
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
							defaultValue={searchParams.get('maxValue') || ''}
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
							onToggle={() => toggleFiltro(item, 'operacion')}
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
							onToggle={() => toggleFiltro(item, 'tipo')}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default UnifiedFilter;