"use client";

import styles from "./SalesForm.module.css";
import { cactus } from "@/app/(views)/ui/fonts";
import { useMemo, useState, type FormEvent } from "react";

type FormData = {
    name: string;
    tel: string;
    email: string;
    propType: string;
    coment: string;
    wantSell: boolean;
    wantRent: boolean;
};

export default function SalesForm() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        tel: "",
        email: "",
        propType: "",
        coment: "",
        wantSell: false,
        wantRent: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const isValid = useMemo(() => {
        return (
            formData.name.trim().length >= 2 &&
            formData.tel.trim().length >= 6 &&
            formData.email.trim().length >= 5 &&
            formData.propType.trim().length >= 2 &&
            formData.coment.trim().length >= 5
        );
    }, [formData]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFormError(null);
        setMessage("");
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));

        setFormError(null);
        setMessage("");
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setFormError(null);

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("¡Listo! Recibimos tu solicitud. Te contactamos a la brevedad.");
                setFormData({
                    name: "",
                    tel: "",
                    email: "",
                    propType: "",
                    coment: "",
                    wantSell: false,
                    wantRent: false,
                });
            } else {
                setFormError(
                    result?.error || "No se pudo enviar. Probá nuevamente en unos minutos."
                );
            }
        } catch {
            setFormError("Ocurrió un error de red. Revisá tu conexión e intentá nuevamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <h1 className={`${styles.title} ${cactus.className}`}>
                    Vendé o alquilá tu propiedad
                </h1>

                <p className={styles.subtitle}>
                    Completá el formulario y coordinamos una tasación o una visita para
                    avanzar con la mejor estrategia.
                </p>

                <div className={styles.notice} role="note">
                    <span className={styles.noticeDot} />
                    <p className={styles.noticeText}>
                        Podés indicar si te interesa <strong>vender</strong>,{" "}
                        <strong>alquilar</strong> o <strong>ambas</strong>. Si todavía no lo
                        definiste, no hay problema: lo vemos juntos.
                    </p>
                </div>
            </header>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label htmlFor="name">Nombre y apellido</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="tel">Teléfono</label>
                            <input
                                id="tel"
                                name="tel"
                                type="tel"
                                placeholder="Ej: 2494 20-8037"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                                autoComplete="tel"
                            />
                            <p className={styles.help}>Incluí código de área. Te contactamos por WhatsApp.</p>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="tuemail@dominio.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="propType">Tipo de propiedad</label>
                            <select
                                id="propType"
                                name="propType"
                                value={formData.propType}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Seleccionar…
                                </option>
                                <option value="Departamento">Departamento</option>
                                <option value="Casa">Casa</option>
                                <option value="Lote">Lote</option>
                                <option value="Local">Local</option>
                                <option value="Campo">Campo</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.intentRow}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="wantSell"
                                checked={formData.wantSell}
                                onChange={handleCheckbox}
                            />
                            <span>
                Quiero <strong>vender</strong>
              </span>
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="wantRent"
                                checked={formData.wantRent}
                                onChange={handleCheckbox}
                            />
                            <span>
                Quiero <strong>alquilar</strong>
              </span>
                        </label>

                        <p className={styles.intentHint}>
                            Opcional: marcá una opción para orientar la consulta. Si todavía no decidiste, podés dejarlo sin marcar.
                        </p>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="coment">Comentarios</label>
                        <textarea
                            id="coment"
                            name="coment"
                            placeholder="Ej: zona, ambientes, estado, si está ocupada y cualquier detalle relevante…"
                            value={formData.coment}
                            onChange={handleChange}
                            required
                            rows={4}
                        />
                    </div>

                    {(formError || message) && (
                        <p
                            className={formError ? styles.feedbackError : styles.feedbackOk}
                            aria-live="polite"
                        >
                            {formError || message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={`${styles.submit} ${cactus.className}`}
                        disabled={isSubmitting || !isValid}
                    >
                        {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                    </button>
                </form>
            </div>
        </section>
    );
}
