"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

import styles from "./NavBar.module.css";

type NavItem = {
	label: string;
	href: string;
	type?: "link" | "dropdown";
	children?: { label: string; href: string }[];
};

export default function NavBar() {
	const pathname = usePathname();
	const isHome = pathname === "/";

	const [isScrolled, setIsScrolled] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const navItems: NavItem[] = useMemo(
		() => [
			{ label: "Inicio", href: "/" },
			{
				label: "Propiedades",
				href: "/propiedades",
				type: "dropdown",
				children: [
					{ label: "Venta", href: "/propiedades?operacion=venta" },
					{ label: "Alquiler", href: "/propiedades?operacion=alquiler" },
				],
			},
			{ label: "Quiero vender", href: "/quiero-vender" },
			{ label: "Sobre nosotros", href: "/nosotros" },
		],
		[]
	);

	useEffect(() => {
		const onScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll as any);
	}, []);

	// Si cambia la ruta, cerramos overlays
	useEffect(() => {
		setDrawerOpen(false);
		setDropdownOpen(false);
	}, [pathname]);

	const headerClass = [
		styles.header,
		isHome && !isScrolled ? styles.headerTransparent : styles.headerSolid,
		isScrolled ? styles.headerShadow : "",
	]
		.filter(Boolean)
		.join(" ");

	const isActive = (href: string) => {
		// Activo por ruta base, ignorando query/hash
		const base = href.split("?")[0].split("#")[0];
		if (base === "/") return pathname === "/";
		return pathname.startsWith(base);
	};

	return (
		<header className={headerClass}>
			<div className={styles.inner}>
				{/* Logo */}
				<Link href="/" className={styles.logoLink} aria-label="Ir al inicio">
					<Image
						src="/logos/fullLogo.png"
						alt="Flora Cordeiro Inmobiliaria"
						width={170}
						height={44}
						className={styles.logo}
						priority
					/>
				</Link>

				{/* Desktop nav */}
				<nav className={styles.navDesktop} aria-label="Navegación principal">
					<Link
						className={`${styles.link} ${isActive("/") ? styles.active : ""}`}
						href="/"
					>
						Inicio
					</Link>

					{/* Dropdown Propiedades */}
					<div
						className={styles.dropdown}
						onMouseEnter={() => setDropdownOpen(true)}
						onMouseLeave={() => setDropdownOpen(false)}
					>
						<button
							type="button"
							className={`${styles.link} ${
								isActive("/propiedades") ? styles.active : ""
							} ${styles.dropdownTrigger}`}
							aria-haspopup="menu"
							aria-expanded={dropdownOpen}
							onClick={() => setDropdownOpen((v) => !v)}
						>
							Propiedades <ChevronDown size={16} className={styles.chev} />
						</button>

						<div
							className={`${styles.dropdownMenu} ${
								dropdownOpen ? styles.dropdownMenuOpen : ""
							}`}
							role="menu"
						>
							<Link className={styles.dropdownItem} href="/propiedades">
								Ver todas
							</Link>
							<Link
								className={styles.dropdownItem}
								href="/propiedades?operacion=venta"
							>
								Venta
							</Link>
							<Link
								className={styles.dropdownItem}
								href="/propiedades?operacion=alquiler"
							>
								Alquiler
							</Link>
						</div>
					</div>

					<Link
						className={`${styles.link} ${
							isActive("/quiero-vender") ? styles.active : ""
						}`}
						href="/quiero-vender"
					>
						Quiero vender
					</Link>

					<Link className={styles.link} href="/nosotros">
						Sobre nosotros
					</Link>

					{/* CTA suave */}
					<Link href="/propiedades" className={styles.cta}>
						Ver propiedades
					</Link>
				</nav>

				{/* Mobile button */}
				<button
					type="button"
					className={styles.mobileBtn}
					aria-label="Abrir menú"
					onClick={() => setDrawerOpen(true)}
				>
					<Menu size={22} />
				</button>
			</div>

			{/* Drawer mobile */}
			{drawerOpen && (
				<div
					className={styles.drawerOverlay}
					role="dialog"
					aria-modal="true"
					aria-label="Menú"
					onClick={() => setDrawerOpen(false)}
				>
					<div
						className={styles.drawerPanel}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.drawerTop}>
							<Link
								href="/"
								className={styles.drawerLogo}
								onClick={() => setDrawerOpen(false)}
							>
								<Image
									src="/logos/fullLogo.png"
									alt="Flora Cordeiro Inmobiliaria"
									width={150}
									height={40}
									className={styles.logo}
								/>
							</Link>

							<button
								type="button"
								className={styles.drawerClose}
								aria-label="Cerrar menú"
								onClick={() => setDrawerOpen(false)}
							>
								<X size={20} />
							</button>
						</div>

						<div className={styles.drawerBody}>
							<Link
								className={styles.drawerLink}
								href="/"
								onClick={() => setDrawerOpen(false)}
							>
								Inicio
							</Link>

							<details className={styles.drawerDetails}>
								<summary className={styles.drawerSummary}>
									Propiedades <ChevronDown size={16} />
								</summary>
								<div className={styles.drawerSub}>
									<Link
										className={styles.drawerSubLink}
										href="/propiedades"
										onClick={() => setDrawerOpen(false)}
									>
										Ver todas
									</Link>
									<Link
										className={styles.drawerSubLink}
										href="/propiedades?operacion=venta"
										onClick={() => setDrawerOpen(false)}
									>
										Venta
									</Link>
									<Link
										className={styles.drawerSubLink}
										href="/propiedades?operacion=alquiler"
										onClick={() => setDrawerOpen(false)}
									>
										Alquiler
									</Link>
								</div>
							</details>

							<Link
								className={styles.drawerLink}
								href="/#quiero-vender"
								onClick={() => setDrawerOpen(false)}
							>
								Quiero vender
							</Link>

							<Link
								className={styles.drawerLink}
								href="/#sobre-nosotros"
								onClick={() => setDrawerOpen(false)}
							>
								Sobre nosotros
							</Link>

							<Link
								className={styles.drawerCta}
								href="/propiedades"
								onClick={() => setDrawerOpen(false)}
							>
								Ver propiedades
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
