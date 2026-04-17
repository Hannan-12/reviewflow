'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Star, Bell, BarChart3, MessageSquare, Zap, Shield,
  ArrowRight, CheckCircle2, ChevronDown, Play, Globe,
} from 'lucide-react'

// ─── Brand colors ──────────────────────────────────────────
const Y = '#F5C518'
const BG = '#1A1A1A'
const CARD = '#242424'
const BORDER = '#333333'

// ─── Translations ──────────────────────────────────────────
const T = {
  en: {
    nav_features: 'Features', nav_reviews: 'Reviews', nav_pricing: 'Pricing', nav_faq: 'FAQ',
    nav_signin: 'Sign in', nav_trial: 'Start free trial',
    hero_badge: 'Now with AI auto-reply agents',
    hero_h1a: 'Review management for', hero_h1b: 'teams that move fast',
    hero_sub: 'Monitor every Google Business Profile review in one dashboard. Get instant alerts, reply with AI, and automate your entire review workflow.',
    hero_cta: 'Start 14-day free trial', hero_demo: 'Watch demo',
    hero_footnote: 'No credit card required · Cancel anytime · Setup in 5 minutes',
    hero_trusted: 'Trusted by businesses across Europe', hero_partner: 'Partner logos coming soon',
    feat_h2: 'Everything your review workflow needs',
    feat_sub: 'From monitoring to AI replies — your entire review operation in one place.',
    feat: [
      { title: 'Instant alerts', desc: 'Email and Slack notifications the moment a review lands — never miss a response window.' },
      { title: 'AI reply suggestions', desc: 'Gemini-powered responses tailored to your brand. Edit, approve, and send in seconds.' },
      { title: 'Analytics & reports', desc: 'Ratings over time, sentiment trends, review volume — all in a clean dashboard.' },
      { title: 'Multi-location', desc: 'Manage every Google Business Profile in one place. No tab switching.' },
      { title: 'Auto-reply agents', desc: 'Set up AI agents to reply automatically based on rating, keywords, or custom rules.' },
      { title: 'Review widgets', desc: 'Embed your best reviews on any website with a single line of code.' },
    ],
    test_h2: 'Loved by business owners',
    pricing_h2: 'Simple, transparent pricing',
    pricing_sub: 'All plans include a 14-day free trial. No credit card required.',
    pricing_monthly: 'Monthly', pricing_annual: 'Annual', pricing_popular: 'Most popular', pricing_start: 'Start free trial',
    plans: [
      { name: 'Lite', profiles: 'up to 3 profiles', desc: 'For solo businesses', features: ['3 Google Business Profiles', 'Email alerts', 'AI reply suggestions', 'Basic reports', 'CSV export'] },
      { name: 'Pro', profiles: 'up to 15 profiles', desc: 'For teams & small chains', features: ['15 Google Business Profiles', 'Email + Slack alerts', 'AI auto-reply agents', 'Advanced reports', 'Review widgets', 'Review auto-tagging'] },
      { name: 'Agency', profiles: 'from 16 profiles', desc: 'For agencies & franchises', features: ['Unlimited profiles', 'Everything in Pro', 'Custom AI prompts', 'Sentiment analysis', 'Magic review links', 'Priority support'] },
    ],
    calc_label: 'Number of profiles',
    faq_h2: 'Frequently asked questions',
    faq: [
      { q: 'What is Reviewup?', a: 'Reviewup is a tool for managing your Google reviews. You can see all reviews across your locations in one dashboard, get instant notifications when a new review arrives, and respond quickly and professionally with AI support.' },
      { q: 'Who is Reviewup for?', a: 'Reviewup is suitable for solo business owners with one location as well as agencies managing reviews for dozens of clients. Whether you run a restaurant, trade business, medical practice, or franchise — if you have Google reviews, Reviewup can help.' },
      { q: 'How long does setup take?', a: "Setup takes less than 5 minutes. Connect your Google Business Profile, choose your plan, and you're ready to go. No technical knowledge required." },
      { q: 'Which Google profiles can I connect?', a: 'You can connect any Google Business Profile for which you have admin access. Depending on your plan, you can manage 3 profiles (Lite), 15 profiles (Pro), or unlimited profiles (Agency).' },
      { q: 'How does the AI reply feature work?', a: 'Reviewup analyzes every new review and automatically suggests a fitting reply — tailored to the tone, language, and content of the review. You can accept, edit, or reject the suggestion with one click. On Pro and Agency plans, you can also set the AI to reply automatically.' },
      { q: 'Can I try Reviewup for free?', a: 'Yes. All plans include a 14-day free trial. No credit card required. Cancel anytime.' },
      { q: 'What happens after the free trial?', a: 'After 14 days, you will be asked if you want to activate a plan. If not, your account will be automatically deactivated — you will not be charged automatically.' },
      { q: 'How does the Agency plan work?', a: 'On the Agency plan, you pay EUR 5 per Google profile per month — starting from the 16th profile. Example: 30 profiles = EUR 150/month. You can add as many locations or client profiles as you need.' },
      { q: 'Is there an annual discount?', a: 'Yes. With annual billing, you save 20% compared to the monthly price.' },
      { q: 'Can I change or cancel my plan at any time?', a: 'Yes. You can upgrade, downgrade, or cancel your plan at any time — no minimum contract period.' },
      { q: 'What languages does Reviewup support?', a: 'The interface is available in German, English, Spanish, Italian, Arabic, Chinese, and Hindi.' },
      { q: 'Is Reviewup GDPR compliant?', a: 'Yes. Reviewup is fully GDPR compliant. All data is stored on European servers and is not shared with third parties.' },
    ],
    cta_h2: 'Ready to take control of your reviews?',
    cta_sub: 'Join businesses using Reviewup to respond faster and grow their reputation.',
    cta_btn: 'Start your free trial', cta_footnote: '14-day free trial · No credit card required',
    footer_desc: 'Google review management for businesses and agencies.',
    footer_social: 'Social links — coming soon', footer_product: 'Product', footer_legal: 'Legal', footer_contact: 'Contact',
    footer_privacy: 'Privacy Policy', footer_terms: 'Terms of Service', footer_imprint: 'Imprint', footer_demo: 'Demo',
    footer_copy: '© 2026 Reviewup. All rights reserved.', footer_gdpr: 'Made in Europe · GDPR compliant',
    cookie_text: 'We use cookies to improve your experience and analyze site usage. By continuing, you agree to our',
    cookie_privacy: 'Privacy Policy', cookie_decline: 'Decline', cookie_accept: 'Accept',
  },
  de: {
    nav_features: 'Funktionen', nav_reviews: 'Bewertungen', nav_pricing: 'Preise', nav_faq: 'FAQ',
    nav_signin: 'Anmelden', nav_trial: 'Kostenlos starten',
    hero_badge: 'Jetzt mit KI-Autoantwort-Agenten',
    hero_h1a: 'Bewertungsmanagement für', hero_h1b: 'Teams, die schnell handeln',
    hero_sub: 'Überwache alle Google Business Profile-Bewertungen in einem Dashboard. Erhalte sofortige Benachrichtigungen, antworte mit KI und automatisiere deinen gesamten Bewertungs-Workflow.',
    hero_cta: '14 Tage kostenlos testen', hero_demo: 'Demo ansehen',
    hero_footnote: 'Keine Kreditkarte · Jederzeit kündbar · Einrichtung in 5 Minuten',
    hero_trusted: 'Vertraut von Unternehmen in ganz Europa', hero_partner: 'Partner-Logos folgen bald',
    feat_h2: 'Alles, was dein Bewertungs-Workflow braucht',
    feat_sub: 'Von der Überwachung bis zur KI-Antwort — dein gesamter Bewertungsbetrieb an einem Ort.',
    feat: [
      { title: 'Sofortige Benachrichtigungen', desc: 'E-Mail- und Slack-Benachrichtigungen in dem Moment, in dem eine Bewertung eintrifft.' },
      { title: 'KI-Antwortvorschläge', desc: 'Von Gemini generierte Antworten, angepasst an deine Marke. Bearbeiten, genehmigen und versenden in Sekunden.' },
      { title: 'Analysen & Berichte', desc: 'Bewertungen über Zeit, Stimmungstrends, Bewertungsvolumen — alles in einem übersichtlichen Dashboard.' },
      { title: 'Mehrere Standorte', desc: 'Verwalte alle Google Business Profile an einem Ort. Kein Tab-Wechsel mehr.' },
      { title: 'Autoantwort-Agenten', desc: 'KI-Agenten, die automatisch basierend auf Bewertung, Stichwörtern oder Regeln antworten.' },
      { title: 'Bewertungs-Widgets', desc: 'Bette deine besten Bewertungen mit einer einzigen Codezeile auf jeder Website ein.' },
    ],
    test_h2: 'Geliebt von Geschäftsinhabern',
    pricing_h2: 'Einfache, transparente Preise',
    pricing_sub: 'Alle Pläne beinhalten eine 14-tägige kostenlose Testversion. Keine Kreditkarte erforderlich.',
    pricing_monthly: 'Monatlich', pricing_annual: 'Jährlich', pricing_popular: 'Beliebteste', pricing_start: 'Kostenlos testen',
    plans: [
      { name: 'Lite', profiles: 'bis zu 3 Profile', desc: 'Für Solo-Unternehmen', features: ['3 Google Business Profile', 'E-Mail-Benachrichtigungen', 'KI-Antwortvorschläge', 'Grundberichte', 'CSV-Export'] },
      { name: 'Pro', profiles: 'bis zu 15 Profile', desc: 'Für Teams & kleine Ketten', features: ['15 Google Business Profile', 'E-Mail + Slack', 'KI-Autoantwort-Agenten', 'Erweiterte Berichte', 'Bewertungs-Widgets', 'Automatisches Tagging'] },
      { name: 'Agency', profiles: 'ab 16 Profile', desc: 'Für Agenturen & Franchises', features: ['Unbegrenzte Profile', 'Alles aus Pro', 'Benutzerdefinierte KI-Prompts', 'Stimmungsanalyse', 'Magic Review Links', 'Prioritätssupport'] },
    ],
    calc_label: 'Anzahl der Profile',
    faq_h2: 'Häufig gestellte Fragen',
    faq: [
      { q: 'Was ist Reviewup?', a: 'Reviewup ist ein Tool zur Verwaltung deiner Google-Bewertungen. Du kannst alle Bewertungen deiner Standorte in einem Dashboard sehen und mit KI-Unterstützung schnell und professionell antworten.' },
      { q: 'Für wen ist Reviewup geeignet?', a: 'Reviewup eignet sich für Solo-Unternehmer mit einem Standort ebenso wie für Agenturen, die Bewertungen für dutzende Kunden verwalten. Ob Restaurant, Handwerksbetrieb, Arztpraxis oder Franchise — wenn du Google-Bewertungen hast, kann Reviewup helfen.' },
      { q: 'Wie lange dauert die Einrichtung?', a: 'Die Einrichtung dauert weniger als 5 Minuten. Verbinde dein Google Business Profile, wähle deinen Plan und du bist startklar. Keine technischen Kenntnisse erforderlich.' },
      { q: 'Welche Google-Profile kann ich verbinden?', a: 'Du kannst jedes Google Business Profile verbinden, für das du Admin-Zugriff hast. Je nach Plan kannst du 3 Profile (Lite), 15 Profile (Pro) oder unbegrenzte Profile (Agency) verwalten.' },
      { q: 'Wie funktioniert die KI-Antwortfunktion?', a: 'Reviewup analysiert jede neue Bewertung und schlägt automatisch eine passende Antwort vor. Du kannst den Vorschlag mit einem Klick akzeptieren, bearbeiten oder ablehnen.' },
      { q: 'Kann ich Reviewup kostenlos testen?', a: 'Ja. Alle Pläne beinhalten eine 14-tägige kostenlose Testversion. Keine Kreditkarte erforderlich. Jederzeit kündbar.' },
      { q: 'Was passiert nach der kostenlosen Testversion?', a: 'Nach 14 Tagen wirst du gefragt, ob du einen Plan aktivieren möchtest. Falls nicht, wird dein Konto automatisch deaktiviert — du wirst nicht automatisch belastet.' },
      { q: 'Wie funktioniert der Agency-Plan?', a: 'Im Agency-Plan zahlst du EUR 5 pro Google-Profil pro Monat — ab dem 16. Profil. Beispiel: 30 Profile = EUR 150/Monat.' },
      { q: 'Gibt es einen Jahresrabatt?', a: 'Ja. Bei jährlicher Abrechnung sparst du 20 % im Vergleich zum monatlichen Preis.' },
      { q: 'Kann ich meinen Plan jederzeit ändern oder kündigen?', a: 'Ja. Du kannst deinen Plan jederzeit upgraden, downgraden oder kündigen — keine Mindestvertragslaufzeit.' },
      { q: 'Welche Sprachen unterstützt Reviewup?', a: 'Die Benutzeroberfläche ist auf Deutsch, Englisch, Spanisch, Italienisch, Arabisch, Chinesisch und Hindi verfügbar.' },
      { q: 'Ist Reviewup DSGVO-konform?', a: 'Ja. Reviewup ist vollständig DSGVO-konform. Alle Daten werden auf europäischen Servern gespeichert und nicht an Dritte weitergegeben.' },
    ],
    cta_h2: 'Bereit, deine Bewertungen in den Griff zu bekommen?',
    cta_sub: 'Schließe dich Unternehmen an, die Reviewup nutzen, um schneller zu antworten und ihre Reputation zu steigern.',
    cta_btn: 'Kostenlose Testversion starten', cta_footnote: '14 Tage kostenlos · Keine Kreditkarte erforderlich',
    footer_desc: 'Google-Bewertungsmanagement für Unternehmen und Agenturen.',
    footer_social: 'Social-Links folgen bald', footer_product: 'Produkt', footer_legal: 'Rechtliches', footer_contact: 'Kontakt',
    footer_privacy: 'Datenschutzerklärung', footer_terms: 'Nutzungsbedingungen', footer_imprint: 'Impressum', footer_demo: 'Demo',
    footer_copy: '© 2026 Reviewup. Alle Rechte vorbehalten.', footer_gdpr: 'Made in Europe · DSGVO-konform',
    cookie_text: 'Wir verwenden Cookies, um deine Erfahrung zu verbessern. Durch die weitere Nutzung stimmst du unserer',
    cookie_privacy: 'Datenschutzerklärung', cookie_decline: 'Ablehnen', cookie_accept: 'Akzeptieren',
  },
  es: {
    nav_features: 'Funciones', nav_reviews: 'Reseñas', nav_pricing: 'Precios', nav_faq: 'FAQ',
    nav_signin: 'Iniciar sesión', nav_trial: 'Prueba gratuita',
    hero_badge: 'Ahora con agentes de respuesta automática IA',
    hero_h1a: 'Gestión de reseñas para', hero_h1b: 'equipos que se mueven rápido',
    hero_sub: 'Monitorea cada reseña de tu Google Business Profile en un solo panel. Recibe alertas instantáneas, responde con IA y automatiza todo tu flujo de trabajo.',
    hero_cta: 'Prueba gratuita de 14 días', hero_demo: 'Ver demo',
    hero_footnote: 'Sin tarjeta de crédito · Cancela cuando quieras · Configuración en 5 minutos',
    hero_trusted: 'Con la confianza de empresas en toda Europa', hero_partner: 'Logos de socios próximamente',
    feat_h2: 'Todo lo que necesita tu flujo de reseñas',
    feat_sub: 'Desde la monitorización hasta las respuestas IA — toda tu operación en un lugar.',
    feat: [
      { title: 'Alertas instantáneas', desc: 'Notificaciones por email y Slack en el momento en que llega una reseña.' },
      { title: 'Sugerencias de respuesta IA', desc: 'Respuestas generadas por Gemini adaptadas a tu marca. Edita, aprueba y envía en segundos.' },
      { title: 'Análisis e informes', desc: 'Valoraciones, tendencias de sentimiento, volumen de reseñas — todo en un panel limpio.' },
      { title: 'Múltiples ubicaciones', desc: 'Gestiona todos tus Google Business Profiles en un solo lugar. Sin cambiar de pestaña.' },
      { title: 'Agentes de respuesta automática', desc: 'Configura agentes IA para responder automáticamente según la valoración o palabras clave.' },
      { title: 'Widgets de reseñas', desc: 'Inserta tus mejores reseñas en cualquier web con una sola línea de código.' },
    ],
    test_h2: 'Amado por los propietarios de negocios',
    pricing_h2: 'Precios simples y transparentes',
    pricing_sub: 'Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.',
    pricing_monthly: 'Mensual', pricing_annual: 'Anual', pricing_popular: 'Más popular', pricing_start: 'Empezar gratis',
    plans: [
      { name: 'Lite', profiles: 'hasta 3 perfiles', desc: 'Para negocios individuales', features: ['3 Google Business Profiles', 'Alertas por email', 'Sugerencias de respuesta IA', 'Informes básicos', 'Exportación CSV'] },
      { name: 'Pro', profiles: 'hasta 15 perfiles', desc: 'Para equipos y pequeñas cadenas', features: ['15 Google Business Profiles', 'Email + Slack', 'Agentes de respuesta automática', 'Informes avanzados', 'Widgets de reseñas', 'Etiquetado automático'] },
      { name: 'Agency', profiles: 'desde 16 perfiles', desc: 'Para agencias y franquicias', features: ['Perfiles ilimitados', 'Todo de Pro', 'Prompts IA personalizados', 'Análisis de sentimiento', 'Magic review links', 'Soporte prioritario'] },
    ],
    calc_label: 'Número de perfiles',
    faq_h2: 'Preguntas frecuentes',
    faq: [
      { q: '¿Qué es Reviewup?', a: 'Reviewup es una herramienta para gestionar tus reseñas de Google. Puedes ver todas las reseñas de tus ubicaciones en un panel y responder rápida y profesionalmente con soporte de IA.' },
      { q: '¿Para quién es Reviewup?', a: 'Reviewup es adecuado para propietarios individuales con una ubicación, así como para agencias que gestionan reseñas para decenas de clientes.' },
      { q: '¿Cuánto tarda la configuración?', a: 'La configuración tarda menos de 5 minutos. Conecta tu Google Business Profile, elige tu plan y estás listo. Sin conocimientos técnicos.' },
      { q: '¿Qué perfiles de Google puedo conectar?', a: 'Puedes conectar cualquier Google Business Profile con acceso de administrador. Según tu plan: 3 perfiles (Lite), 15 (Pro) o ilimitados (Agency).' },
      { q: '¿Cómo funciona la función de respuesta IA?', a: 'Reviewup analiza cada nueva reseña y sugiere automáticamente una respuesta adecuada. Puedes aceptar, editar o rechazar la sugerencia con un clic.' },
      { q: '¿Puedo probar Reviewup gratis?', a: 'Sí. Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito. Cancela cuando quieras.' },
      { q: '¿Qué pasa después de la prueba gratuita?', a: 'Después de 14 días, se te preguntará si quieres activar un plan. Si no, tu cuenta se desactivará automáticamente sin cargo.' },
      { q: '¿Cómo funciona el plan Agency?', a: 'En el plan Agency pagas EUR 5 por perfil al mes — desde el perfil 16. Ejemplo: 30 perfiles = EUR 150/mes.' },
      { q: '¿Hay descuento anual?', a: 'Sí. Con facturación anual ahorras un 20% respecto al precio mensual.' },
      { q: '¿Puedo cambiar o cancelar mi plan en cualquier momento?', a: 'Sí. Puedes actualizar, reducir o cancelar tu plan en cualquier momento — sin período mínimo.' },
      { q: '¿Qué idiomas admite Reviewup?', a: 'La interfaz está disponible en alemán, inglés, español, italiano, árabe, chino e hindi.' },
      { q: '¿Es Reviewup compatible con el RGPD?', a: 'Sí. Reviewup cumple plenamente con el RGPD. Todos los datos se almacenan en servidores europeos.' },
    ],
    cta_h2: '¿Listo para tomar el control de tus reseñas?',
    cta_sub: 'Únete a los negocios que usan Reviewup para responder más rápido y crecer en reputación.',
    cta_btn: 'Comenzar prueba gratuita', cta_footnote: '14 días de prueba gratuita · Sin tarjeta de crédito',
    footer_desc: 'Gestión de reseñas de Google para negocios y agencias.',
    footer_social: 'Redes sociales — próximamente', footer_product: 'Producto', footer_legal: 'Legal', footer_contact: 'Contacto',
    footer_privacy: 'Política de Privacidad', footer_terms: 'Términos de Servicio', footer_imprint: 'Aviso Legal', footer_demo: 'Demo',
    footer_copy: '© 2026 Reviewup. Todos los derechos reservados.', footer_gdpr: 'Hecho en Europa · Cumplimiento RGPD',
    cookie_text: 'Usamos cookies para mejorar tu experiencia. Al continuar, aceptas nuestra',
    cookie_privacy: 'Política de Privacidad', cookie_decline: 'Rechazar', cookie_accept: 'Aceptar',
  },
  it: {
    nav_features: 'Funzionalità', nav_reviews: 'Recensioni', nav_pricing: 'Prezzi', nav_faq: 'FAQ',
    nav_signin: 'Accedi', nav_trial: 'Prova gratuita',
    hero_badge: 'Ora con agenti di risposta automatica IA',
    hero_h1a: 'Gestione delle recensioni per', hero_h1b: 'team che si muovono velocemente',
    hero_sub: 'Monitora ogni recensione di Google Business Profile in un unico pannello. Ricevi notifiche istantanee, rispondi con IA e automatizza il tuo flusso di lavoro.',
    hero_cta: 'Prova gratuita di 14 giorni', hero_demo: 'Guarda la demo',
    hero_footnote: 'Nessuna carta di credito · Annulla quando vuoi · Configurazione in 5 minuti',
    hero_trusted: 'Scelto da aziende in tutta Europa', hero_partner: 'Loghi dei partner in arrivo',
    feat_h2: 'Tutto ciò di cui ha bisogno il tuo flusso di recensioni',
    feat_sub: 'Dal monitoraggio alle risposte IA — tutta la tua operazione in un unico posto.',
    feat: [
      { title: 'Avvisi istantanei', desc: 'Notifiche via email e Slack nel momento in cui arriva una recensione.' },
      { title: 'Suggerimenti di risposta IA', desc: 'Risposte generate da Gemini adattate al tuo brand. Modifica, approva e invia in pochi secondi.' },
      { title: 'Analisi e report', desc: 'Valutazioni nel tempo, tendenze del sentiment, volume delle recensioni — tutto in un pannello chiaro.' },
      { title: 'Multi-location', desc: 'Gestisci tutti i tuoi Google Business Profile in un unico posto. Nessun cambio di scheda.' },
      { title: 'Agenti di risposta automatica', desc: 'Configura agenti IA per rispondere automaticamente in base alla valutazione o parole chiave.' },
      { title: 'Widget recensioni', desc: 'Incorpora le tue migliori recensioni su qualsiasi sito web con una sola riga di codice.' },
    ],
    test_h2: 'Amato dai titolari di aziende',
    pricing_h2: 'Prezzi semplici e trasparenti',
    pricing_sub: 'Tutti i piani includono 14 giorni di prova gratuita. Nessuna carta di credito.',
    pricing_monthly: 'Mensile', pricing_annual: 'Annuale', pricing_popular: 'Più popolare', pricing_start: 'Inizia gratis',
    plans: [
      { name: 'Lite', profiles: 'fino a 3 profili', desc: 'Per attività individuali', features: ['3 Google Business Profile', 'Avvisi email', 'Suggerimenti di risposta IA', 'Report di base', 'Esportazione CSV'] },
      { name: 'Pro', profiles: 'fino a 15 profili', desc: 'Per team e piccole catene', features: ['15 Google Business Profile', 'Email + Slack', 'Agenti di risposta automatica', 'Report avanzati', 'Widget recensioni', 'Tagging automatico'] },
      { name: 'Agency', profiles: 'da 16 profili', desc: 'Per agenzie e franchise', features: ['Profili illimitati', 'Tutto di Pro', 'Prompt IA personalizzati', 'Analisi del sentiment', 'Magic review links', 'Supporto prioritario'] },
    ],
    calc_label: 'Numero di profili',
    faq_h2: 'Domande frequenti',
    faq: [
      { q: "Cos'è Reviewup?", a: 'Reviewup è uno strumento per gestire le tue recensioni Google. Puoi vedere tutte le recensioni in un pannello e rispondere rapidamente con il supporto IA.' },
      { q: 'Per chi è adatto Reviewup?', a: 'Reviewup è adatto sia per i titolari di un singolo locale che per le agenzie che gestiscono le recensioni per decine di clienti.' },
      { q: 'Quanto tempo richiede la configurazione?', a: 'La configurazione richiede meno di 5 minuti. Connetti il tuo Google Business Profile, scegli il piano e sei pronto.' },
      { q: 'Quali profili Google posso collegare?', a: 'Puoi collegare qualsiasi Google Business Profile con accesso amministratore. A seconda del piano: 3 profili (Lite), 15 (Pro) o illimitati (Agency).' },
      { q: 'Come funziona la risposta IA?', a: 'Reviewup analizza ogni nuova recensione e suggerisce automaticamente una risposta adatta. Puoi accettare, modificare o rifiutare il suggerimento con un clic.' },
      { q: 'Posso provare Reviewup gratuitamente?', a: 'Sì. Tutti i piani includono 14 giorni di prova gratuita. Nessuna carta di credito. Annulla quando vuoi.' },
      { q: 'Cosa succede dopo la prova gratuita?', a: 'Dopo 14 giorni ti verrà chiesto se vuoi attivare un piano. Altrimenti il tuo account verrà disattivato automaticamente.' },
      { q: 'Come funziona il piano Agency?', a: 'Con il piano Agency paghi EUR 5 per profilo al mese — dal 16° profilo. Esempio: 30 profili = EUR 150/mese.' },
      { q: "C'è uno sconto annuale?", a: 'Sì. Con la fatturazione annuale risparmi il 20% rispetto al prezzo mensile.' },
      { q: 'Posso cambiare o annullare il piano in qualsiasi momento?', a: 'Sì. Puoi aggiornare, ridurre o annullare il piano in qualsiasi momento — senza contratto minimo.' },
      { q: 'Quali lingue supporta Reviewup?', a: "L'interfaccia è disponibile in tedesco, inglese, spagnolo, italiano, arabo, cinese e hindi." },
      { q: 'Reviewup è conforme al GDPR?', a: 'Sì. Reviewup è pienamente conforme al GDPR. Tutti i dati sono memorizzati su server europei.' },
    ],
    cta_h2: 'Pronto a prendere il controllo delle tue recensioni?',
    cta_sub: "Unisciti alle aziende che usano Reviewup per rispondere più velocemente e far crescere la reputazione.",
    cta_btn: 'Inizia la tua prova gratuita', cta_footnote: '14 giorni di prova gratuita · Nessuna carta di credito',
    footer_desc: 'Gestione delle recensioni Google per aziende e agenzie.',
    footer_social: 'Link social — in arrivo', footer_product: 'Prodotto', footer_legal: 'Legale', footer_contact: 'Contatto',
    footer_privacy: 'Privacy Policy', footer_terms: 'Termini di Servizio', footer_imprint: 'Note Legali', footer_demo: 'Demo',
    footer_copy: '© 2026 Reviewup. Tutti i diritti riservati.', footer_gdpr: 'Made in Europe · Conforme GDPR',
    cookie_text: "Utilizziamo i cookie per migliorare la tua esperienza. Continuando, accetti la nostra",
    cookie_privacy: 'Privacy Policy', cookie_decline: 'Rifiuta', cookie_accept: 'Accetta',
  },
  ar: {
    nav_features: 'الميزات', nav_reviews: 'التقييمات', nav_pricing: 'الأسعار', nav_faq: 'الأسئلة الشائعة',
    nav_signin: 'تسجيل الدخول', nav_trial: 'ابدأ مجاناً',
    hero_badge: 'الآن مع وكلاء الرد التلقائي بالذكاء الاصطناعي',
    hero_h1a: 'إدارة التقييمات لـ', hero_h1b: 'الفرق التي تتحرك بسرعة',
    hero_sub: 'راقب كل تقييمات Google Business Profile في لوحة تحكم واحدة. احصل على تنبيهات فورية وأجب باستخدام الذكاء الاصطناعي.',
    hero_cta: 'تجربة مجانية لمدة 14 يوماً', hero_demo: 'مشاهدة العرض',
    hero_footnote: 'لا بطاقة ائتمان · إلغاء في أي وقت · الإعداد في 5 دقائق',
    hero_trusted: 'موثوق به من قِبل الشركات في أوروبا', hero_partner: 'شعارات الشركاء قريباً',
    feat_h2: 'كل ما يحتاجه سير عمل تقييماتك',
    feat_sub: 'من المراقبة إلى الردود بالذكاء الاصطناعي — كل عملياتك في مكان واحد.',
    feat: [
      { title: 'تنبيهات فورية', desc: 'إشعارات البريد الإلكتروني وSlack في اللحظة التي يصل فيها التقييم.' },
      { title: 'اقتراحات الرد بالذكاء الاصطناعي', desc: 'ردود مدعومة بـ Gemini ومخصصة لعلامتك التجارية. تحرير والموافقة والإرسال في ثوانٍ.' },
      { title: 'التحليلات والتقارير', desc: 'التقييمات بمرور الوقت واتجاهات المشاعر وحجم التقييمات — كل شيء في لوحة تحكم واضحة.' },
      { title: 'مواقع متعددة', desc: 'إدارة جميع ملفات Google Business Profile في مكان واحد. لا تبديل للتبويبات.' },
      { title: 'وكلاء الرد التلقائي', desc: 'إعداد وكلاء الذكاء الاصطناعي للرد تلقائياً بناءً على التقييم أو الكلمات المفتاحية.' },
      { title: 'أدوات التقييم', desc: 'تضمين أفضل تقييماتك في أي موقع ويب بسطر واحد من التعليمات البرمجية.' },
    ],
    test_h2: 'يحبه أصحاب الأعمال',
    pricing_h2: 'أسعار بسيطة وشفافة',
    pricing_sub: 'تشمل جميع الخطط تجربة مجانية لمدة 14 يوماً. لا بطاقة ائتمان مطلوبة.',
    pricing_monthly: 'شهري', pricing_annual: 'سنوي', pricing_popular: 'الأكثر شيوعاً', pricing_start: 'ابدأ مجاناً',
    plans: [
      { name: 'Lite', profiles: 'حتى 3 ملفات', desc: 'للأعمال الفردية', features: ['3 ملفات Google Business', 'تنبيهات البريد الإلكتروني', 'اقتراحات الرد بالذكاء الاصطناعي', 'تقارير أساسية', 'تصدير CSV'] },
      { name: 'Pro', profiles: 'حتى 15 ملفاً', desc: 'للفرق والسلاسل الصغيرة', features: ['15 ملف Google Business', 'البريد + Slack', 'وكلاء الرد التلقائي', 'تقارير متقدمة', 'أدوات التقييم', 'وضع العلامات التلقائي'] },
      { name: 'Agency', profiles: 'من 16 ملفاً', desc: 'للوكالات والامتيازات', features: ['ملفات غير محدودة', 'كل ميزات Pro', 'مطالبات AI مخصصة', 'تحليل المشاعر', 'روابط التقييم السحرية', 'دعم ذو أولوية'] },
    ],
    calc_label: 'عدد الملفات',
    faq_h2: 'الأسئلة الشائعة',
    faq: [
      { q: 'ما هو Reviewup؟', a: 'Reviewup هو أداة لإدارة تقييمات Google. يمكنك رؤية جميع التقييمات في لوحة تحكم واحدة والرد بشكل سريع ومهني بدعم الذكاء الاصطناعي.' },
      { q: 'لمن Reviewup مناسب؟', a: 'Reviewup مناسب لأصحاب الأعمال الفرديين ذوي موقع واحد، وكذلك للوكالات التي تدير التقييمات لعشرات العملاء.' },
      { q: 'كم يستغرق الإعداد؟', a: 'الإعداد يستغرق أقل من 5 دقائق. قم بتوصيل ملف Google Business Profile الخاص بك، واختر خطتك، وستكون جاهزاً.' },
      { q: 'ما هي ملفات Google التي يمكنني توصيلها؟', a: 'يمكنك توصيل أي ملف Google Business Profile لديك وصول مسؤول إليه. بحسب خطتك: 3 ملفات (Lite)، 15 (Pro)، أو غير محدودة (Agency).' },
      { q: 'كيف تعمل ميزة الرد بالذكاء الاصطناعي؟', a: 'يحلل Reviewup كل تقييم جديد ويقترح تلقائياً رداً مناسباً. يمكنك قبول الاقتراح أو تعديله أو رفضه بنقرة واحدة.' },
      { q: 'هل يمكنني تجربة Reviewup مجاناً؟', a: 'نعم. تشمل جميع الخطط تجربة مجانية لمدة 14 يوماً. لا بطاقة ائتمان. إلغاء في أي وقت.' },
      { q: 'ماذا يحدث بعد التجربة المجانية؟', a: 'بعد 14 يوماً، سيُطلب منك تفعيل خطة. إذا لم تفعل ذلك، سيتم إلغاء تنشيط حسابك تلقائياً.' },
      { q: 'كيف تعمل خطة Agency؟', a: 'في خطة Agency، تدفع EUR 5 لكل ملف شهرياً — ابتداءً من الملف السادس عشر. مثال: 30 ملفاً = EUR 150/شهر.' },
      { q: 'هل هناك خصم سنوي؟', a: 'نعم. مع الفوترة السنوية توفر 20٪ مقارنة بالسعر الشهري.' },
      { q: 'هل يمكنني تغيير خطتي أو إلغاؤها في أي وقت؟', a: 'نعم. يمكنك الترقية أو التخفيض أو الإلغاء في أي وقت — بدون حد أدنى لفترة العقد.' },
      { q: 'ما هي اللغات التي يدعمها Reviewup؟', a: 'الواجهة متاحة بالألمانية والإنجليزية والإسبانية والإيطالية والعربية والصينية والهندية.' },
      { q: 'هل Reviewup متوافق مع GDPR؟', a: 'نعم. Reviewup متوافق تماماً مع GDPR. جميع البيانات مخزنة على خوادم أوروبية.' },
    ],
    cta_h2: 'هل أنت مستعد للسيطرة على تقييماتك؟',
    cta_sub: 'انضم إلى الشركات التي تستخدم Reviewup للرد بشكل أسرع وتنمية سمعتها.',
    cta_btn: 'ابدأ تجربتك المجانية', cta_footnote: 'تجربة مجانية 14 يوماً · لا بطاقة ائتمان مطلوبة',
    footer_desc: 'إدارة تقييمات Google للشركات والوكالات.',
    footer_social: 'روابط التواصل الاجتماعي قريباً', footer_product: 'المنتج', footer_legal: 'قانوني', footer_contact: 'تواصل معنا',
    footer_privacy: 'سياسة الخصوصية', footer_terms: 'شروط الخدمة', footer_imprint: 'بيانات قانونية', footer_demo: 'عرض توضيحي',
    footer_copy: '© 2026 Reviewup. جميع الحقوق محفوظة.', footer_gdpr: 'صنع في أوروبا · متوافق مع GDPR',
    cookie_text: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار، فأنت توافق على',
    cookie_privacy: 'سياسة الخصوصية', cookie_decline: 'رفض', cookie_accept: 'قبول',
  },
  zh: {
    nav_features: '功能', nav_reviews: '评价', nav_pricing: '定价', nav_faq: '常见问题',
    nav_signin: '登录', nav_trial: '免费试用',
    hero_badge: '现已推出AI自动回复功能',
    hero_h1a: '评价管理，为', hero_h1b: '快速行动的团队而生',
    hero_sub: '在一个仪表板中监控所有Google商家主页评价。获取即时提醒，使用AI回复，并自动化您的整个评价工作流程。',
    hero_cta: '开始14天免费试用', hero_demo: '观看演示',
    hero_footnote: '无需信用卡 · 随时取消 · 5分钟内完成设置',
    hero_trusted: '受欧洲各地企业信赖', hero_partner: '合作伙伴徽标即将推出',
    feat_h2: '您的评价工作流程所需的一切',
    feat_sub: '从监控到AI回复——您的全部评价运营尽在一处。',
    feat: [
      { title: '即时提醒', desc: '收到评价的瞬间即可获得电子邮件和Slack通知。' },
      { title: 'AI回复建议', desc: 'Gemini驱动的回复，专为您的品牌量身定制。几秒钟内编辑、审批并发送。' },
      { title: '分析与报告', desc: '随时间变化的评分、情感趋势、评价数量——尽在简洁的仪表板中。' },
      { title: '多地点管理', desc: '在一处管理所有Google商家主页。无需切换标签。' },
      { title: '自动回复代理', desc: '设置AI代理，根据评分、关键词或自定义规则自动回复。' },
      { title: '评价小工具', desc: '用一行代码将您最好的评价嵌入任何网站。' },
    ],
    test_h2: '深受业主喜爱',
    pricing_h2: '简单透明的定价',
    pricing_sub: '所有方案均包含14天免费试用。无需信用卡。',
    pricing_monthly: '月付', pricing_annual: '年付', pricing_popular: '最受欢迎', pricing_start: '免费开始',
    plans: [
      { name: 'Lite', profiles: '最多3个主页', desc: '适合个体企业', features: ['3个Google商家主页', '电子邮件提醒', 'AI回复建议', '基础报告', 'CSV导出'] },
      { name: 'Pro', profiles: '最多15个主页', desc: '适合团队和小型连锁', features: ['15个Google商家主页', '邮件 + Slack提醒', 'AI自动回复代理', '高级报告', '评价小工具', '自动标签'] },
      { name: 'Agency', profiles: '16个主页起', desc: '适合代理机构和特许经营', features: ['无限主页', 'Pro全部功能', '自定义AI提示', '情感分析', '神奇评价链接', '优先支持'] },
    ],
    calc_label: '主页数量',
    faq_h2: '常见问题',
    faq: [
      { q: '什么是Reviewup？', a: 'Reviewup是管理您Google评价的工具。您可以在一个仪表板中查看所有地点的评价，并借助AI快速专业地回复。' },
      { q: 'Reviewup适合哪些用户？', a: 'Reviewup适合拥有一个地点的个体业主，以及为数十位客户管理评价的代理机构。' },
      { q: '设置需要多长时间？', a: '设置不超过5分钟。连接您的Google商家主页，选择方案，即可开始使用。无需技术知识。' },
      { q: '我可以连接哪些Google主页？', a: '您可以连接任何您有管理员权限的Google商家主页。根据方案：3个主页（Lite）、15个（Pro）或无限主页（Agency）。' },
      { q: 'AI回复功能如何工作？', a: 'Reviewup分析每条新评价并自动建议合适的回复。您可以一键接受、编辑或拒绝建议。' },
      { q: '我可以免费试用Reviewup吗？', a: '是的。所有方案均包含14天免费试用。无需信用卡。随时取消。' },
      { q: '免费试用结束后会怎样？', a: '14天后，系统会询问您是否要激活方案。如果不激活，您的账户将自动停用，不会自动收费。' },
      { q: 'Agency方案如何运作？', a: '在Agency方案中，您每月为每个主页支付EUR 5——从第16个主页开始。例如：30个主页 = EUR 150/月。' },
      { q: '有年付折扣吗？', a: '有。选择年付，与月付相比可节省20%。' },
      { q: '我可以随时更改或取消方案吗？', a: '可以。您可以随时升级、降级或取消方案——无最短合同期限。' },
      { q: 'Reviewup支持哪些语言？', a: '界面提供德语、英语、西班牙语、意大利语、阿拉伯语、中文和印地语版本。' },
      { q: 'Reviewup符合GDPR吗？', a: '是的。Reviewup完全符合GDPR。所有数据存储在欧洲服务器上，不与第三方共享。' },
    ],
    cta_h2: '准备好掌控您的评价了吗？',
    cta_sub: '加入使用Reviewup的企业，更快回复并提升声誉。',
    cta_btn: '开始免费试用', cta_footnote: '14天免费试用 · 无需信用卡',
    footer_desc: '面向企业和代理机构的Google评价管理工具。',
    footer_social: '社交媒体链接即将推出', footer_product: '产品', footer_legal: '法律', footer_contact: '联系我们',
    footer_privacy: '隐私政策', footer_terms: '服务条款', footer_imprint: '法律声明', footer_demo: '演示',
    footer_copy: '© 2026 Reviewup。保留所有权利。', footer_gdpr: '欧洲制造 · 符合GDPR',
    cookie_text: '我们使用Cookie来改善您的体验。继续使用即表示您同意我们的',
    cookie_privacy: '隐私政策', cookie_decline: '拒绝', cookie_accept: '接受',
  },
  hi: {
    nav_features: 'विशेषताएं', nav_reviews: 'समीक्षाएं', nav_pricing: 'मूल्य', nav_faq: 'सामान्य प्रश्न',
    nav_signin: 'साइन इन करें', nav_trial: 'मुफ्त ट्रायल शुरू करें',
    hero_badge: 'अब AI ऑटो-रिप्लाई एजेंट के साथ',
    hero_h1a: 'समीक्षा प्रबंधन के लिए', hero_h1b: 'तेज़ गति से काम करने वाली टीमें',
    hero_sub: 'एक डैशबोर्ड में हर Google Business Profile समीक्षा मॉनिटर करें। तत्काल अलर्ट पाएं, AI से उत्तर दें और अपना पूरा समीक्षा वर्कफ़्लो स्वचालित करें।',
    hero_cta: '14 दिन की मुफ्त ट्रायल', hero_demo: 'डेमो देखें',
    hero_footnote: 'क्रेडिट कार्ड की जरूरत नहीं · कभी भी रद्द करें · 5 मिनट में सेटअप',
    hero_trusted: 'यूरोप भर के व्यवसायों द्वारा विश्वसनीय', hero_partner: 'पार्टनर लोगो जल्द आ रहे हैं',
    feat_h2: 'आपके समीक्षा वर्कफ़्लो के लिए सब कुछ',
    feat_sub: 'मॉनिटरिंग से AI उत्तरों तक — आपका पूरा समीक्षा संचालन एक जगह।',
    feat: [
      { title: 'तत्काल अलर्ट', desc: 'समीक्षा आते ही ईमेल और Slack अधिसूचनाएं — कोई रिस्पॉन्स विंडो न चूकें।' },
      { title: 'AI उत्तर सुझाव', desc: 'Gemini-संचालित उत्तर आपके ब्रांड के लिए अनुकूलित। सेकंड में संपादित करें, अनुमोदित करें और भेजें।' },
      { title: 'एनालिटिक्स और रिपोर्ट', desc: 'समय के साथ रेटिंग, सेंटीमेंट ट्रेंड, समीक्षा वॉल्यूम — सब एक साफ डैशबोर्ड में।' },
      { title: 'मल्टी-लोकेशन', desc: 'एक जगह से हर Google Business Profile प्रबंधित करें। टैब बदलने की जरूरत नहीं।' },
      { title: 'ऑटो-रिप्लाई एजेंट', desc: 'रेटिंग, कीवर्ड या कस्टम नियमों के आधार पर स्वचालित रूप से उत्तर देने के लिए AI एजेंट सेट करें।' },
      { title: 'रिव्यू विजेट', desc: 'एक लाइन कोड से किसी भी वेबसाइट पर अपनी सर्वश्रेष्ठ समीक्षाएं एम्बेड करें।' },
    ],
    test_h2: 'व्यवसाय स्वामियों का पसंदीदा',
    pricing_h2: 'सरल, पारदर्शी मूल्य निर्धारण',
    pricing_sub: 'सभी प्लान में 14 दिन की मुफ्त ट्रायल शामिल है। क्रेडिट कार्ड की जरूरत नहीं।',
    pricing_monthly: 'मासिक', pricing_annual: 'वार्षिक', pricing_popular: 'सबसे लोकप्रिय', pricing_start: 'मुफ्त शुरू करें',
    plans: [
      { name: 'Lite', profiles: 'अधिकतम 3 प्रोफाइल', desc: 'एकल व्यवसायों के लिए', features: ['3 Google Business Profiles', 'ईमेल अलर्ट', 'AI उत्तर सुझाव', 'बेसिक रिपोर्ट', 'CSV एक्सपोर्ट'] },
      { name: 'Pro', profiles: 'अधिकतम 15 प्रोफाइल', desc: 'टीम और छोटी चेन के लिए', features: ['15 Google Business Profiles', 'Email + Slack अलर्ट', 'AI ऑटो-रिप्लाई एजेंट', 'उन्नत रिपोर्ट', 'रिव्यू विजेट', 'ऑटो-टैगिंग'] },
      { name: 'Agency', profiles: '16 प्रोफाइल से', desc: 'एजेंसी और फ्रेंचाइज़ के लिए', features: ['असीमित प्रोफाइल', 'Pro की सभी सुविधाएं', 'कस्टम AI प्रॉम्प्ट', 'सेंटीमेंट विश्लेषण', 'मैजिक रिव्यू लिंक', 'प्राथमिकता सहायता'] },
    ],
    calc_label: 'प्रोफाइल की संख्या',
    faq_h2: 'अक्सर पूछे जाने वाले प्रश्न',
    faq: [
      { q: 'Reviewup क्या है?', a: 'Reviewup आपकी Google समीक्षाओं को प्रबंधित करने का एक टूल है। आप एक डैशबोर्ड में सभी समीक्षाएं देख सकते हैं और AI सहायता से जल्दी और पेशेवर तरीके से उत्तर दे सकते हैं।' },
      { q: 'Reviewup किसके लिए उपयुक्त है?', a: 'Reviewup एक स्थान वाले एकल व्यवसाय स्वामियों के साथ-साथ दर्जनों ग्राहकों के लिए समीक्षाओं का प्रबंधन करने वाली एजेंसियों के लिए उपयुक्त है।' },
      { q: 'सेटअप में कितना समय लगता है?', a: 'सेटअप में 5 मिनट से कम समय लगता है। अपना Google Business Profile कनेक्ट करें, अपना प्लान चुनें और शुरू हो जाएं।' },
      { q: 'मैं कौन से Google प्रोफाइल कनेक्ट कर सकता हूं?', a: 'आप कोई भी Google Business Profile कनेक्ट कर सकते हैं जिसका आपके पास एडमिन एक्सेस है। प्लान के अनुसार: 3 (Lite), 15 (Pro) या असीमित (Agency)।' },
      { q: 'AI उत्तर फीचर कैसे काम करता है?', a: 'Reviewup हर नई समीक्षा का विश्लेषण करता है और स्वचालित रूप से एक उपयुक्त उत्तर सुझाता है। आप एक क्लिक से सुझाव स्वीकार, संपादित या अस्वीकार कर सकते हैं।' },
      { q: 'क्या मैं Reviewup मुफ्त में आजमा सकता हूं?', a: 'हाँ। सभी प्लान में 14 दिन की मुफ्त ट्रायल शामिल है। कोई क्रेडिट कार्ड नहीं। कभी भी रद्द करें।' },
      { q: 'मुफ्त ट्रायल के बाद क्या होता है?', a: '14 दिनों के बाद आपसे पूछा जाएगा कि क्या आप कोई प्लान सक्रिय करना चाहते हैं। नहीं तो आपका अकाउंट अपने आप निष्क्रिय हो जाएगा।' },
      { q: 'Agency प्लान कैसे काम करता है?', a: 'Agency प्लान में प्रति Google प्रोफाइल प्रति माह EUR 5 — 16वें प्रोफाइल से शुरू। उदाहरण: 30 प्रोफाइल = EUR 150/माह।' },
      { q: 'क्या वार्षिक छूट है?', a: 'हाँ। वार्षिक बिलिंग के साथ मासिक मूल्य की तुलना में 20% बचत होती है।' },
      { q: 'क्या मैं किसी भी समय अपना प्लान बदल या रद्द कर सकता हूं?', a: 'हाँ। आप किसी भी समय अपग्रेड, डाउनग्रेड या रद्द कर सकते हैं — कोई न्यूनतम अनुबंध अवधि नहीं।' },
      { q: 'Reviewup किन भाषाओं का समर्थन करता है?', a: 'इंटरफ़ेस जर्मन, अंग्रेजी, स्पेनिश, इतालवी, अरबी, चीनी और हिंदी में उपलब्ध है।' },
      { q: 'क्या Reviewup GDPR अनुपालक है?', a: 'हाँ। Reviewup पूरी तरह से GDPR अनुपालक है। सभी डेटा यूरोपीय सर्वर पर संग्रहीत है।' },
    ],
    cta_h2: 'अपनी समीक्षाओं पर नियंत्रण लेने के लिए तैयार हैं?',
    cta_sub: 'Reviewup का उपयोग करने वाले व्यवसायों से जुड़ें और तेज़ी से उत्तर देकर अपनी प्रतिष्ठा बढ़ाएं।',
    cta_btn: 'अपनी मुफ्त ट्रायल शुरू करें', cta_footnote: '14 दिन की मुफ्त ट्रायल · क्रेडिट कार्ड की जरूरत नहीं',
    footer_desc: 'व्यवसायों और एजेंसियों के लिए Google समीक्षा प्रबंधन।',
    footer_social: 'सोशल लिंक — जल्द आ रहे हैं', footer_product: 'उत्पाद', footer_legal: 'कानूनी', footer_contact: 'संपर्क',
    footer_privacy: 'गोपनीयता नीति', footer_terms: 'सेवा की शर्तें', footer_imprint: 'कानूनी नोटिस', footer_demo: 'डेमो',
    footer_copy: '© 2026 Reviewup. सर्वाधिकार सुरक्षित।', footer_gdpr: 'यूरोप में निर्मित · GDPR अनुपालक',
    cookie_text: 'हम अनुभव बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं। जारी रखकर आप हमारी',
    cookie_privacy: 'गोपनीयता नीति', cookie_decline: 'अस्वीकार करें', cookie_accept: 'स्वीकार करें',
  },
} as const

type LangCode = keyof typeof T

// ─── Language list ──────────────────────────────────────────
const languages: { code: LangCode; label: string; rtl: boolean }[] = [
  { code: 'en', label: 'English', rtl: false },
  { code: 'de', label: 'Deutsch', rtl: false },
  { code: 'es', label: 'Español', rtl: false },
  { code: 'it', label: 'Italiano', rtl: false },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'zh', label: '中文', rtl: false },
  { code: 'hi', label: 'हिन्दी', rtl: false },
]

// ─── Feature icons (fixed order, no translation needed) ────
const featIcons = [Bell, MessageSquare, BarChart3, Star, Zap, Shield]

// ─── Testimonials (English only — quotes) ──────────────────
const testimonials = [
  { quote: 'Reviewup completely changed how we handle reviews. The AI suggestions are spot-on and our response rate has never been better.', author: 'Sarah M.', role: 'Owner, The Bake House', stars: 5 },
  { quote: 'The AI suggestions are genuinely good. I barely edit them before hitting send — it saves me a lot of time every day.', author: 'James K.', role: 'Marketing Manager, FitLife Studios', stars: 5 },
  { quote: 'Managing multiple locations used to be chaos. Reviewup brings everything into one place and makes it effortless.', author: 'Priya R.', role: 'Head of Operations, Nosh Group', stars: 5 },
]

// ─── Sub-components ─────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-semibold text-white text-sm md:text-base">{q}</span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: Y, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && <p className="text-sm text-gray-400 leading-relaxed pb-5">{a}</p>}
    </div>
  )
}

function AgencyCalculator({ label }: { label: string }) {
  const [raw, setRaw] = useState('20')
  const parsed = parseInt(raw) || 0
  const hasError = raw !== '' && parsed < 16
  const profiles = Math.max(16, parsed)
  const price = profiles * 5
  return (
    <div className="mt-4">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
      <p className="text-[11px] text-gray-500 mb-2">Minimum 16 profiles for an Agency account</p>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={() => setRaw(String(Math.max(16, parseInt(raw) || 16)))}
          className="w-24 px-3 py-2 rounded-lg text-sm font-bold text-center text-white border outline-none transition-colors"
          style={{ background: BG, borderColor: hasError ? '#ef4444' : Y }}
        />
        <span className="text-white font-bold text-lg">= EUR {price}/mo</span>
      </div>
      {hasError
        ? <p className="text-xs text-red-400 mt-1.5">Minimum 16 profiles required</p>
        : <p className="text-xs text-gray-500 mt-2">20 profiles = EUR 100/month · 50 profiles = EUR 250/month</p>
      }
    </div>
  )
}

function CookieBanner({ text, privacy, decline, accept }: { text: string; privacy: string; decline: string; accept: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 shadow-2xl" style={{ background: '#111', borderTop: `2px solid ${Y}` }}>
      <p className="text-sm text-gray-300 max-w-2xl">
        {text}{' '}
        <Link href="/privacy" style={{ color: Y }} className="underline hover:no-underline">{privacy}</Link>.
      </p>
      <div className="flex gap-3 shrink-0">
        <button onClick={() => setDismissed(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 border border-gray-600 hover:border-gray-400 transition-colors">
          {decline}
        </button>
        <button onClick={() => setDismissed(true)} className="px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-90" style={{ background: Y, color: BG }}>
          {accept}
        </button>
      </div>
    </div>
  )
}

function LanguageSwitcher({ lang, onSelect }: { lang: LangCode; onSelect: (code: LangCode) => void }) {
  const [open, setOpen] = useState(false)
  const current = languages.find((l) => l.code === lang) ?? languages[0]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 transition-colors">
        <Globe className="w-3.5 h-3.5" />
        {current.label}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50 min-w-36" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { onSelect(l.code); setOpen(false) }}
              className="w-full px-4 py-2.5 text-sm text-left hover:text-white transition-colors"
              style={{ color: lang === l.code ? Y : '#9ca3af', direction: l.rtl ? 'rtl' : 'ltr' }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────
export default function HomePage() {
  const [annual, setAnnual] = useState(false)
  const [lang, setLang] = useState<LangCode>('en')
  const t = T[lang]
  const isRtl = languages.find((l) => l.code === lang)?.rtl ?? false

  const plans = [
    { ...t.plans[0], price: annual ? Math.round(29 * 0.8) : 29, highlight: false, agency: false },
    { ...t.plans[1], price: annual ? Math.round(59 * 0.8) : 59, highlight: true, agency: false },
    { ...t.plans[2], price: 5, highlight: false, agency: true },
  ]

  return (
    <div style={{ background: BG, color: '#fff', minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(26,26,26,0.95)', borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: Y }}>
              <Star className="w-3.5 h-3.5" style={{ color: BG, fill: BG }} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Reviewup</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">{t.nav_features}</a>
            <a href="#testimonials" className="hover:text-white transition-colors">{t.nav_reviews}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.nav_pricing}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t.nav_faq}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher lang={lang} onSelect={setLang} />
            <Link href="/login">
              <button className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">{t.nav_signin}</button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-90" style={{ background: Y, color: BG }}>
                {t.nav_trial}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${Y}22 0%, transparent 65%)` }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-48 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${Y}60, transparent)` }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 border" style={{ background: `${Y}12`, color: Y, borderColor: `${Y}35` }}>
            <Zap className="w-3 h-3" />
            {t.hero_badge}
            <ArrowRight className="w-3 h-3" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-white">
            {t.hero_h1a}<br />
            <span style={{ color: Y }}>{t.hero_h1b}</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">{t.hero_sub}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Link href="/signup">
              <button className="h-12 px-8 text-base font-bold rounded-xl flex items-center gap-2 transition-all hover:opacity-90" style={{ background: Y, color: BG, boxShadow: `0 8px 32px ${Y}40` }}>
                {t.hero_cta} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="flex items-center gap-2 h-12 px-6 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-500">
              <Play className="w-3.5 h-3.5" /> {t.hero_demo}
            </button>
          </div>

          {/* Footnote */}
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mb-12">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: Y }} />
            {t.hero_footnote}
          </p>

          {/* Dashboard screenshot */}
          <div className="relative mx-auto max-w-5xl">
            {/* Glow behind the image */}
            <div className="absolute -inset-4 rounded-3xl pointer-events-none blur-3xl opacity-30" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 80%, ${Y}, transparent)` }} />

            <div className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}`, boxShadow: `0 32px 80px -12px rgba(0,0,0,0.8), 0 0 0 1px ${BORDER}` }}>
              {/* Minimal chrome bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: '#0e0e0e', borderBottom: `1px solid ${BORDER}` }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-1.5 h-5 px-3 rounded text-[11px] text-gray-600" style={{ background: '#1a1a1a', border: `1px solid ${BORDER}` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: Y }} />
                    app.reviewup.io/dashboard
                  </div>
                </div>
              </div>
              <Image
                src="/dashboard.png"
                alt="Reviewup dashboard"
                width={1600}
                height={900}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{t.feat_h2}</h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">{t.feat_sub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.feat.map((f, i) => {
            const Icon = featIcons[i]
            return (
              <div key={i} className="rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-500/30" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${Y}18` }}>
                  <Icon className="w-5 h-5" style={{ color: Y }} />
                </div>
                <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{t.test_h2}</h2>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4" style={{ fill: Y, color: Y }} />)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-3.5 h-3.5" style={{ fill: Y, color: Y }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-gray-300">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{t.pricing_h2}</h2>
          <p className="text-lg text-gray-400 mb-8">{t.pricing_sub}</p>
          <div className="inline-flex items-center gap-1 rounded-xl p-1" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <button onClick={() => setAnnual(false)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={!annual ? { background: Y, color: BG } : { color: '#9ca3af' }}>
              {t.pricing_monthly}
            </button>
            <button onClick={() => setAnnual(true)} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2" style={annual ? { background: Y, color: BG } : { color: '#9ca3af' }}>
              {t.pricing_annual} <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${Y}20`, color: Y }}>-20%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div key={p.name} className="relative rounded-2xl p-7 flex flex-col" style={{ background: p.highlight ? Y : CARD, border: `1px solid ${p.highlight ? Y : BORDER}`, transform: p.highlight ? 'scale(1.02)' : undefined }}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1" style={{ background: BG, color: Y }}>
                  {t.pricing_popular}
                </div>
              )}
              <p className="font-bold mb-1" style={{ color: p.highlight ? BG : '#fff' }}>{p.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-bold" style={{ fontSize: p.agency ? '1.875rem' : '2.25rem', color: p.highlight ? BG : '#fff' }}>
                  EUR {p.agency ? '5' : p.price}
                </span>
                <span className="text-sm mb-1.5" style={{ color: p.highlight ? `${BG}99` : '#6b7280' }}>
                  {p.agency ? '/profile/mo' : '/mo'}
                </span>
              </div>
              <p className="text-xs mb-1 font-medium" style={{ color: p.highlight ? `${BG}cc` : '#9ca3af' }}>{p.profiles}</p>
              <p className="text-sm mb-4" style={{ color: p.highlight ? `${BG}99` : '#6b7280' }}>{p.desc}</p>
              {p.agency && <AgencyCalculator label={t.calc_label} />}
              <ul className="space-y-2.5 flex-1 mb-7 mt-4">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: p.highlight ? BG : '#d1d5db' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: p.highlight ? BG : Y }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <button className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={p.highlight ? { background: BG, color: Y } : { background: Y, color: BG }}>
                  {t.pricing_start}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">{t.faq_h2}</h2>
          </div>
          {t.faq.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl px-10 py-16 text-center" style={{ background: Y }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-black/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: BG }}>{t.cta_h2}</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: `${BG}99` }}>{t.cta_sub}</p>
            <Link href="/signup">
              <button className="px-8 h-12 text-base font-bold rounded-xl flex items-center gap-2 mx-auto transition-all hover:opacity-90" style={{ background: BG, color: Y }}>
                {t.cta_btn} <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <p className="text-sm mt-4" style={{ color: `${BG}70` }}>{t.cta_footnote}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: Y }}>
                  <Star className="w-3 h-3" style={{ color: BG, fill: BG }} />
                </div>
                <span className="font-bold text-sm text-white">Reviewup</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t.footer_desc}</p>
              <div className="flex gap-3 mt-4">
                <span className="text-xs text-gray-700">{t.footer_social}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{t.footer_product}</p>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.nav_features}</a>
                <a href="#pricing" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.nav_pricing}</a>
                <a href="#faq" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.nav_faq}</a>
                <Link href="/demo" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.footer_demo}</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{t.footer_legal}</p>
              <div className="space-y-2.5">
                <Link href="/privacy" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.footer_privacy}</Link>
                <Link href="/terms" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.footer_terms}</Link>
                <Link href="/imprint" className="block text-sm text-gray-400 hover:text-white transition-colors">{t.footer_imprint}</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">{t.footer_contact}</p>
              <div className="space-y-2.5">
                <a href="mailto:hello@reviewup.de" className="block text-sm text-gray-400 hover:text-white transition-colors">hello@reviewup.de</a>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p className="text-sm text-gray-600">{t.footer_copy}</p>
            <p className="text-sm text-gray-600">{t.footer_gdpr}</p>
          </div>
        </div>
      </footer>

      <CookieBanner text={t.cookie_text} privacy={t.cookie_privacy} decline={t.cookie_decline} accept={t.cookie_accept} />
    </div>
  )
}
