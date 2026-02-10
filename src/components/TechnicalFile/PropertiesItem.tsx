import Image from "next/image";
import styles from "./TechnicalSheet.module.css";

type PropertyItemProps = {
	imgSrc: string;
	label: string;
	value: string | number;
};

export default function PropertyItem({ imgSrc, label, value }: PropertyItemProps) {
	return (
		<div className={styles.featureItem}>
			<div className={styles.featureIcon}>
				<Image src={imgSrc} alt="" width={18} height={18} aria-hidden />
			</div>
			<div className={styles.featureText}>
				<p className={styles.featureLabel}>{label}</p>
				<p className={styles.featureValue}>{value}</p>
			</div>
		</div>
	);
}
