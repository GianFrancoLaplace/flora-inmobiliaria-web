import Image from 'next/image';
import styles from './PropertyView.module.css';

type PropertyItemProps = {
	imgSrc: string;
	label: string;
	value: string | number;
};

export default function PropertyItem({ imgSrc, label, value }: PropertyItemProps) {
	return (
		<div className={styles.itemProperties}>
			<div className={styles.itemInfo}>
				<Image
					src={imgSrc}
					alt={label}
					width={20}
					height={20}
				/>
				<h5>
					{label}: {value}
				</h5>
			</div>
		</div>
	);
}