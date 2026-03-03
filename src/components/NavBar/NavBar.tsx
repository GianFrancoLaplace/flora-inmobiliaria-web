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
	const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
	const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

	const navItems: NavItem[] = useMemo(
		() => [
			{ label: "Inicio", href: "/" },
			{
				label: "Propiedades",
				href: "/propiedades",
				type: "dropdown",
				children: [
					{ label: "Ver todas", href: "/propiedades" },
					{ label: "Venta", href: "/propiedades?operacion=venta" },
					{ label: "Alquiler", href: "/propiedades?operacion=alquiler" },
				],
			},
			{ label: "Quiero vender", href: "/quiero-vender" },
			{ label: "Sobre nosotros", href: "/nosotros" },
			{ label: "Contacto", href: "/#contacto" },
		],
		[]
	);

	useEffect(() => {
		const onScroll = () => setIsScrolled(window.scrollY > 10);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll as any);
	}, []);

	useEffect(() => {
		// al cambiar de ruta, cerramos todo
		setDrawerOpen(false);
		setDesktopDropdownOpen(false);
		setMobileDropdownOpen(false);
	}, [pathname]);

	const headerClass = [
		styles.header,
		isHome && !isScrolled ? styles.headerTransparent : styles.headerSolid,
		isScrolled ? styles.headerShadow : "",
	]
		.filter(Boolean)
		.join(" ");

	const isActive = (href: string) => {
		const base = href.split("?")[0].split("#")[0];
		if (base === "/") return pathname === "/";
		return pathname.startsWith(base);
	};

	const contactHref = isHome ? "#contacto" : "/#contacto";

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
				<nav className={styles.navDesktop} aria-label="NavegaciÃ³n principal">
					<Link
						className={`${styles.link} ${isActive("/") ? styles.active : ""}`}
						href="/"
					>
						Inicio
					</Link>

					{/* Dropdown Propiedades */}
					<div
						className={styles.dropdown}
						onMouseEnter={() => setDesktopDropdownOpen(true)}
						onMouseLeave={() => setDesktopDropdownOpen(false)}
					>
						<button
							type="button"
							className={`${styles.link} ${
								isActive("/propiedades") ? styles.active : ""
							} ${styles.dropdownTrigger}`}
							aria-haspopup="menu"
							aria-expanded={desktopDropdownOpen}
							onClick={() => setDesktopDropdownOpen((v) => !v)}
						>
							Propiedades{" "}
							<ChevronDown
								size={16}
								className={`${styles.chev} ${
									desktopDropdownOpen ? styles.chevOpen : ""
								}`}
							/>
						</button>

						<div
							className={`${styles.dropdownMenu} ${
								desktopDropdownOpen ? styles.dropdownMenuOpen : ""
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

					<Link
						className={`${styles.link} ${isActive("/nosotros") ? styles.active : ""}`}
						href="/nosotros"
					>
						Sobre nosotros
					</Link>

					<Link className={styles.link} href={contactHref}>
						Contacto
					</Link>

					<Link href="/propiedades" className={styles.cta}>
						Ver propiedades
					</Link>
				</nav>

				{/* Mobile button */}
				<button
					type="button"
					className={styles.mobileBtn}
					aria-label="Abrir menÃº"
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
					aria-label="MenÃº"
					onClick={() => setDrawerOpen(false)}
				>
					<div className={styles.drawerPanel} style={{ background: "#000", position: "fixed", top: 0, right: 0, bottom: 0, height: "100dvh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
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
								aria-label="Cerrar menÃº"
								onClick={() => setDrawerOpen(false)}
							>
								<X size={18} />
							</button>
						</div>

						<nav className={styles.drawerNav} aria-label="NavegaciÃ³n mÃ³vil">
							{navItems.map((item) => {
								if (item.type === "dropdown" && item.children) {
									return (
										<div key={item.label} className={styles.drawerGroup}>
											<button
												type="button"
												className={`${styles.drawerLink} ${styles.drawerDropdownBtn}`}
												onClick={() => setMobileDropdownOpen((v) => !v)}
												aria-expanded={mobileDropdownOpen}
											>
												<span>Propiedades</span>
												<ChevronDown
													size={16}
													className={`${styles.chev} ${
														mobileDropdownOpen ? styles.chevOpen : ""
													}`}
												/>
											</button>

											<div
												className={`${styles.drawerSub} ${
													mobileDropdownOpen ? styles.drawerSubOpen : ""
												}`}
											>
												{item.children.map((c) => (
													<Link
														key={c.href}
														href={c.label === "Contacto" ? contactHref : c.href}
														className={styles.drawerSubLink}
														onClick={() => setDrawerOpen(false)}
													>
														{c.label}
													</Link>
												))}
											</div>
										</div>
									);
								}

								const href = item.label === "Contacto" ? contactHref : item.href;

								return (
									<Link
										key={item.href}
										href={href}
										className={`${styles.drawerLink} ${
											isActive(item.href) ? styles.drawerActive : ""
										}`}
										onClick={() => setDrawerOpen(false)}
									>
										{item.label}
									</Link>
								);
							})}

							<Link
								href="/propiedades"
								className={styles.drawerCta}
								onClick={() => setDrawerOpen(false)}
							>
								Ver propiedades
							</Link>
						</nav>
					</div>
				</div>
			)}
		</header>
	);
}

