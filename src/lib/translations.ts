export type Language = "es" | "en";

export const translations = {
	es: {
		// Header
		appName: "isPep",
		byJanovix: "Janovix",
		appDescription: "Verificación de Personas Políticamente Expuestas",

		// Loading
		loading: "Cargando...",

		// Hero
		heroTitle: "Verificación PEP para Compliance",
		heroDescription:
			"Consulte si un individuo es o ha sido una Persona Políticamente Expuesta. Nuestra herramienta verifica múltiples bases de datos nacionales e internacionales.",

		// Search Form
		searchPlaceholder: "Ingrese el nombre completo del individuo...",
		searchButton: "Verificar PEP",
		searchIndividualPlaceholder: "BUSCAR INDIVIDUO...",
		searchCompanyPlaceholder: "BUSCAR EMPRESA...",

		// Home / search welcome
		homeTitle: "Watchlist",
		homeSubtitle:
			"Verifique personas y empresas frente a listas de sanciones, PEP y medios adversos en un solo flujo.",
		tourStep1Title: "Tipo de sujeto",
		tourStep1Desc:
			"Use el interruptor para elegir Individuo o Empresa según el tipo de sujeto.",
		tourStep2Title: "Campo de búsqueda",
		tourStep2Desc:
			"Escriba el nombre legal completo en mayúsculas (mínimo 4 caracteres).",
		tourStep3Title: "Ajustes avanzados",
		tourStep3Desc:
			"Abra el ícono de ajustes para añadir fecha de nacimiento o constitución, identificadores (RFC, CURP, etc.) o países y reducir homónimos.",
		tourStep4Title: "Ejecutar búsqueda",
		tourStep4Desc:
			"Pulse el botón con flecha o la tecla Enter para iniciar la consulta.",
		tourNext: "Siguiente",
		tourPrev: "Anterior",
		tourDone: "Listo",
		tourProgress: "{{current}} de {{total}}",

		// Recent Searches / Queries
		recentSearches: "Consultas recientes",
		noRecentSearches: "No hay consultas recientes",
		noRecentSearchesDescription:
			"Realiza tu primera verificación PEP para ver tus consultas aquí.",
		startFirstSearch: "Realizar primera consulta",
		newQuery: "Nueva Consulta",
		viewAllQueries: "Ver todas las consultas",

		// Loading View
		verifyingIdentity: "Verificando identidad",
		searching: "Buscando:",
		progress: "Progreso",
		timeElapsed: "Tiempo transcurrido:",
		loadingWarning:
			"No actualice ni abandone esta página. La consulta puede tardar hasta un minuto mientras se verifican múltiples bases de datos.",
		important: "Importante:",

		// Loading Steps
		step1: "Conectando con bases de datos nacionales...",
		step2: "Consultando registros internacionales...",
		step3: "Verificando listas de sanciones...",
		step4: "Analizando coincidencias...",
		step5: "Generando informe...",

		// Result View
		isPep: "Es PEP",
		isNotPep: "No es PEP",
		isPepDescription:
			"Esta persona es o ha sido una Persona Políticamente Expuesta.",
		isNotPepDescription:
			"No se encontraron registros de este individuo en las bases de datos consultadas.",
		yes: "Sí",
		no: "No",
		searchInfo: "Información de la búsqueda",
		searchedName: "Nombre buscado:",
		queryDate: "Fecha de consulta:",
		queryId: "ID de consulta:",
		newSearch: "Realizar otra búsqueda",
		exportPdf: "Exportar a PDF",
		exportingPdf: "Generando PDF...",
		pdfScreeningReport: "Reporte de Screening",
		pdfSubject: "Sujeto",
		pdfEntityType: "Tipo",
		pdfDate: "Fecha",
		pdfStatus: "Estado",
		pdfBirthDate: "Fecha de nacimiento",
		pdfQueryId: "ID",
		pdfClean: "Limpio",
		pdfMatches: "Coincidencias",
		pdfError: "Error",
		pdfDisabled: "Deshabilitado",
		pdfNoMatches: "Sin coincidencias encontradas",
		pdfMatchesFound: "coincidencia(s)",
		pdfGeneratedAt: "Generado",
		pdfPoweredBy: "Powered by",
		pdfProbability: "Probabilidad",
		pdfRiskLevel: "Nivel de riesgo",
		pdfScore: "Score",
		pdfName: "Nombre",
		pdfDataset: "Lista",
		pdfRisk: "Riesgo",
		noData: "Sin datos",
		na: "N/A",

		pepRecordDetails: "Detalles del registro PEP",
		dataset: "Base de datos",
		recordId: "ID del registro",
		registeredName: "Nombre registrado",
		aliases: "Aliases",
		birthDate: "Fecha de nacimiento",
		countries: "Países",
		firstSeen: "Primera publicación",
		lastChange: "Último cambio",
		lastSeen: "Última observación",
		noAliases: "Sin aliases",
		noCountries: "Sin países",

		// Theme
		themeLabel: "Tema",
		themeSystem: "Sistema",
		themeLight: "Claro",
		themeDark: "Oscuro",
		// Language
		languageLabel: "Idioma",

		profile: "Mi perfil",
		settings: "Configuración",
		help: "Ayuda y soporte",
		notifications: "Notificaciones",
		logout: "Cerrar sesión",

		// Subscription banner
		subscriptionFreeTier: "Plan Gratuito",
		subscriptionFreeTierDesc:
			"Estás usando el plan gratuito con búsquedas limitadas.",
		subscriptionNearLimit: "Cerca del límite",
		subscriptionNearLimitDesc: "Te estás acercando al límite de {metrics}.",
		subscriptionLimitReached: "Límite alcanzado",
		subscriptionLimitReachedDesc:
			"Has alcanzado el límite de {metrics}. Mejora tu plan para continuar.",
		subscriptionUpgrade: "Mejorar plan",
		subscriptionMetricNotices: "avisos",
		subscriptionMetricUsers: "usuarios",
		subscriptionMetricAlerts: "búsquedas",
		subscriptionMetricTransactions: "transacciones",
		"subscription.noWatchlistAccess.title": "Acceso Watchlist No Disponible",
		"subscription.noWatchlistAccess.description":
			"Tu suscripción actual no incluye acceso al producto Watchlist.",
		"subscription.noWatchlistAccess.upgradePrompt":
			"Para acceder a consultas de listas de vigilancia, suscríbete a un plan que incluya Watchlist.",
		"subscription.noWatchlistAccess.upgradeCta": "Ver planes disponibles",
		"subscription.noWatchlistAccess.backToSettings": "Ir a configuración",

		// Error pages
		errorNotFoundTitle: "Página no encontrada",
		errorNotFoundDescription:
			"La página que buscas no existe o fue movida. Verifica la URL o vuelve a un lugar seguro.",
		errorServerTitle: "Algo salió mal",
		errorServerDescription:
			"Se produjo un error inesperado al cargar esta página.",
		errorServerHelp:
			"Intenta nuevamente o vuelve al inicio si el problema continúa.",
		errorUnauthorizedTitle: "Inicio de sesión requerido",
		errorUnauthorizedDescription:
			"Necesitas iniciar sesión para acceder a esta página.",
		errorUnauthorizedReason:
			"Si llegaste aquí desde un enlace compartido o un marcador, inicia sesión e inténtalo de nuevo.",
		errorForbiddenTitle: "Acceso denegado",
		errorForbiddenDescription: "No tienes acceso a esta página.",
		errorForbiddenReason:
			"Esto puede ocurrir si tu rol no incluye este permiso o si tu acceso fue revocado.",
		errorGoBack: "Volver",
		errorHome: "Inicio",
		errorTryAgain: "Intentar de nuevo",
		errorSignIn: "Iniciar sesión",
		errorRateLimitTitle: "Demasiadas solicitudes",
		errorRateLimitDescription:
			"Estamos recibiendo demasiadas solicitudes desde tu IP. Por favor espera {seconds} segundos.",
		errorRateLimitDescriptionReady: "Ya puedes intentarlo de nuevo.",
		errorRateLimitRetry: "Reintentar",

		// Common additions
		dismiss: "Descartar",
		privacy: "Privacidad",
		terms: "Términos",
		backToQueries: "Volver a consultas",
		backToHome: "Volver al inicio",
		openCalendar: "Abrir calendario",

		// Search form advanced
		advancedSearch: "Búsqueda avanzada",
		hideAdvancedSearch: "Ocultar búsqueda avanzada",
		identifiersLabel: "Identificadores (separados por coma)",
		identifiersPlaceholder: "RFC, CURP, etc.",
		birthDateLabel: "Fecha de nacimiento (YYYY-MM-DD)",
		dateOfCreationLabel: "Fecha de creación (YYYY-MM-DD)",
		countriesLabel: "Países",
		countriesPlaceholder: "MX, US, CO... (códigos ISO separados por coma)",
		countriesPlaceholderSelect: "Seleccionar países...",

		// Watchlist search results
		matchesFound: "{count} coincidencias encontradas",
		noMatchesFound: "No se encontraron coincidencias",
		noMatchesDescription:
			"No se encontraron registros que coincidan con los criterios de búsqueda en las bases de datos consultadas.",
		highestScore: "Mayor coincidencia:",
		score: "Puntuación",
		scoreBreakdown: "Desglose de puntuación",
		vectorScore: "Similitud semántica",
		nameScore: "Similitud de nombre",
		metaScore: "Coincidencia de metadatos",
		identifierMatch: "Coincidencia exacta de identificador",
		highMatch: "Coincidencia alta",
		mediumMatch: "Coincidencia media",
		lowMatch: "Coincidencia baja",
		viewDetails: "Ver detalles",
		hideDetails: "Ocultar detalles",
		matchDetails: "Detalles de la coincidencia",
		searchResultsFor: "Resultados de búsqueda para",
		searchNotFound: "Búsqueda no encontrada",
		searchFailed: "Error al realizar la búsqueda",

		// PEP Results
		pepResultsTitle: "Resultados PEP (Medios Oficiales)",
		pepSearching: "Buscando en Medios Oficiales...",
		pepError: "Error al buscar en PEP:",
		pepResultsCount: "Se encontraron {count} resultados",
		pepResultsCached: "Se encontraron {count} resultados (cacheados)",
		pepNoResults: "No se encontraron resultados en los Medios Oficiales",
		pepInstitution: "Institución:",
		pepPosition: "Cargo:",
		pepArea: "Área:",
		pepState: "Entidad Federativa:",
		pepPeriod: "Período:",
		ofacResultsTitle: "Resultados OFAC ({count})",
		sat69bResultsTitle: "Resultados SAT 69-B ({count})",
		noOfacResults: "No se encontraron coincidencias en la lista OFAC.",
		noSat69bResults: "No se encontraron coincidencias en la lista SAT 69-B.",
		unscResultsTitle: "Resultados ONU ({count})",
		noUnscResults:
			"No se encontraron coincidencias en la lista de sanciones de la ONU.",
		taxpayerStatus: "Estatus del Contribuyente",
		unknownName: "Desconocido",
		showDetails: "Mostrar detalles",
		identifiers: "Identificadores",
		addresses: "Direcciones",
		sanctions: "Sanciones",

		// Query History page
		queryHistoryTitle: "Historial de Consultas",
		queryHistoryDescription: "Ver y administrar tus verificaciones anteriores",
		searchQueriesPlaceholder: "Buscar consultas...",
		filterAll: "Todos",
		filterIndividual: "Individual",
		filterCompany: "Empresa",
		tableQuery: "Consulta",
		tableType: "Tipo",
		tableSource: "Origen",
		tableUser: "Usuario",
		tableDate: "Fecha",
		tableStatus: "Estado",
		tableRiskIndicators: "Indicadores",
		riskIndicatorOfac: "OFAC: coincidencias encontradas",
		riskIndicatorUnsc: "UNSC: coincidencias encontradas",
		riskIndicatorSat69b: "SAT 69-B/EFOS: coincidencias encontradas",
		riskIndicatorPep: "PEP: coincidencias encontradas",
		riskIndicatorAdverseMedia: "Medios adversos: riesgo detectado",
		riskIndicatorNone: "Sin indicadores",
		sourceManual: "Búsqueda",
		sourceAmlScreening: "Screening AML",
		sourceWatchlistQuery: "Consulta en listas",
		sourceAml: "AML",
		sourceCsvImport: "Importación CSV",
		sourceApi: "API",
		sourceUnknown: "Desconocido",
		userImportLabel: "Importación",
		noQueriesFound: "No se encontraron consultas que coincidan con tus filtros",
		noQueriesYet:
			"Aún no hay consultas. Comienza buscando un individuo o empresa.",
		showingQueries: "Mostrando {from} a {to} de {total} consultas",
		previous: "Anterior",
		next: "Siguiente",

		// Organization picker
		organizations: "Organizaciones",
		switchOrganization: "Cambiar organización",
		myOrganizations: "Mis organizaciones",
		memberOf: "Miembro de",
		createOrganization: "Crear organización",
		orgSettings: "Configuración",
		orgLimitReached: "Límite de organizaciones alcanzado",

		// Status labels
		statusPending: "Pendiente",
		statusRunning: "Procesando",
		statusCompleted: "Completado",
		statusFailed: "Fallido",
		statusPartial: "Parcial",
		statusSkipped: "Omitido",

		// Screening results
		statusSearching: "Buscando...",
		statusClean: "Limpio",
		statusMatches: "Coincidencias",
		statusError: "Error",
		statusCompleted2: "Completado",
		liveConnection: "En vivo",
		processingAsync: "Procesando búsquedas asíncronas (PEP, Medios Adversos)…",

		// Screening section titles
		ofacSanctionsList: "Lista de Sanciones OFAC",
		unSanctionsList: "Lista de Sanciones ONU",
		sat69bTitle: "SAT 69-B",
		pepTitle: "Persona Políticamente Expuesta (PEP)",
		adverseMediaTitle: "Medios Adversos",

		// Screening loading/result messages
		verifyingOfac: "Verificando lista OFAC...",
		noOfacMatches: "Sin coincidencias en la lista OFAC.",
		verifyingUn: "Verificando lista ONU...",
		noUnMatches: "Sin coincidencias en la lista de sanciones ONU.",
		verifyingSat69b: "Verificando lista SAT 69-B...",
		noSat69bMatches: "Sin coincidencias en la lista SAT 69-B.",

		// PEP subsections
		pepOfficialSubtitle: "Medios Oficiales",
		pepAiSubtitle: "PEP - Búsqueda en internet",
		searchingPepOfficial: "Buscando en Medios Oficiales...",
		pepOfficialError: "Error al consultar los Medios Oficiales",
		pepOfficialNoMatch: "No identificado como PEP en Medios Oficiales.",
		analyzingAi: "Analizando con inteligencia artificial...",
		pepAiError: "Error en la detección con IA",
		pepAiNoMatch: "No identificado como PEP por análisis con IA.",
		probability: "Probabilidad:",
		sources: "Fuentes:",
		institution: "Institución:",
		position: "Cargo:",
		area: "Área:",

		// Adverse media
		analyzingAdverseMedia: "Analizando medios y fuentes públicas...",
		adverseMediaError: "Error al analizar medios adversos",
		noAdverseMedia: "Sin indicios de medios adversos.",
		riskLevel: "Nivel de riesgo:",
		riskLevelNone: "Ninguno",
		riskLevelLow: "Bajo",
		riskLevelMedium: "Medio",
		riskLevelHigh: "Alto",

		// Legal fine print (footer)
		legalDisclaimerFinePrint: `Los resultados de esta herramienta tienen fines informativos y de apoyo a la debida diligencia únicamente. No constituyen asesoría legal, fiscal ni de cumplimiento normativo. La información se proporciona "tal cual", sin garantía de exactitud, integridad o vigencia. Las fuentes oficiales (SAT, UIF, OFAC, Consejo de Seguridad de la ONU, entre otras) son las únicas autoridades para fines definitivos. Una coincidencia o señal no implica culpabilidad, ilícito ni responsabilidad legal. El estatus PEP, listas de sanciones y hallazgos en medios adversos son indicadores de riesgo que requieren análisis profesional. La verificación por nombre puede producir falsos positivos por homonimia. Debe verificar la identidad con datos adicionales (fecha de nacimiento, fecha de constitución, país de origen u otros). La información se obtiene de fuentes públicas disponibles (publicaciones oficiales, bases regulatorias abiertas y medios de acceso público), en un proceso análogo a lo que cualquier persona puede realizar manualmente. Usted es el único responsable de las decisiones de cumplimiento y las acciones que adopte. Se requiere criterio profesional y verificación independiente antes de cualquier medida adversa. Los resultados son una instantánea en un momento determinado; los estatus en listas oficiales (p. ej. SAT 69-B) pueden cambiar—confirme siempre en la fuente original. Este servicio se rige por las leyes aplicables de los Estados Unidos Mexicanos.`,

		// Type switch
		individual: "Individual",
		company: "Empresa",
		individuals: "Individuos",
		companies: "Empresas",

		// Info page
		aboutWatchlist: "Acerca de Watchlist",
		aboutWatchlistDescription:
			"Plataforma de verificación de antecedentes y debida diligencia para oficiales de cumplimiento, equipos KYC y operadores de negocios en el mercado mexicano y la región USMCA.",
		whatIsWatchlist: "¿Qué es Watchlist?",
		whatIsWatchlistDescription:
			"Watchlist es una herramienta de verificación de antecedentes diseñada para oficiales de cumplimiento y KYC dentro de organizaciones, así como operadores de negocios que necesitan verificar clientes o asociados antes de realizar negocios. La plataforma consolida múltiples fuentes de datos públicos en un solo flujo de consulta, permitiendo la toma de decisiones informada a velocidad.",
		dataSources: "Fuentes de Datos",
		howItWorks: "Cómo Funciona",
		importantDisclaimer: "Aviso Importante",
		disclaimerText1:
			"Watchlist es una herramienta de verificación que agrega datos disponibles públicamente de fuentes gubernamentales oficiales. La información proporcionada es solo para fines informativos y no debe considerarse como asesoría legal o una determinación definitiva de riesgo.",
		disclaimerText2:
			"Los usuarios son responsables de realizar su propia debida diligencia y verificar la información a través de canales oficiales. Janovix no es responsable de las decisiones tomadas con base en la información proporcionada por esta plataforma.",

		// Info page data sources
		ofacSdnDescription:
			"La Lista de Nacionales Especialmente Designados y Personas Bloqueadas (SDN) de la Oficina de Control de Activos Extranjeros (OFAC) del Departamento del Tesoro de EE.UU. Incluye individuos y entidades sancionados con quienes se prohíben transacciones comerciales bajo la ley estadounidense.",
		sat69bDescription:
			"Empresas que Facturan Operaciones Simuladas (EFOS), publicadas por el Servicio de Administración Tributaria (SAT) de México bajo el Artículo 69-B del Código Fiscal de la Federación. Identifica contribuyentes presuntamente involucrados en la emisión de facturas que amparan operaciones inexistentes.",
		unSanctionsDescription:
			"Lista Consolidada de Sanciones del Consejo de Seguridad de las Naciones Unidas. Incluye individuos y entidades sujetos a medidas de sanciones impuestas por el Consejo de Seguridad de la ONU.",
		pepDatabaseDescription:
			"Base de datos de Personas Políticamente Expuestas (PEP) de los medios oficiales del gobierno mexicano. Identifica individuos que ocupan o han ocupado cargos públicos prominentes.",

		// Info page how it works
		howItWorksStep1Title: "1. Ingresar Consulta",
		howItWorksStep1Description:
			"Ingresa el nombre de un individuo o empresa que deseas verificar. Opcionalmente puedes proporcionar información adicional como fecha de nacimiento, identificadores (RFC, CURP) o país de origen para mejorar la precisión de coincidencia.",
		howItWorksStep2Title: "2. Algoritmo de Búsqueda Híbrida",
		howItWorksStep2Description:
			"Nuestro sistema realiza una búsqueda híbrida que combina coincidencia exacta de identificadores, búsqueda semántica vectorial y puntuación de similitud de nombres Jaro-Winkler en todas las fuentes de datos simultáneamente. Esto asegura alta precisión mientras captura variaciones en nombres y ortografías.",
		howItWorksStep3Title: "3. Revisar Resultados",
		howItWorksStep3Description:
			"Los resultados se organizan por fuente de datos (OFAC, SAT 69-B, UNSC, PEP) con puntuaciones de coincidencia e información detallada para cada resultado. Puedes revisar los detalles completos de cada coincidencia para tomar decisiones informadas sobre tu proceso de debida diligencia.",

		// External link dialog
		externalLinkTitle: "Redirección a sitio externo",
		externalLinkDescription: "Serás redirigido a un sitio web de terceros.",
		externalLinkBody:
			"Este sitio no está bajo el control de Janovix y puede tener sus propias políticas de privacidad y términos de uso.",
		externalLinkVisiting: "Estás a punto de visitar",
		externalLinkDontShowAgain: "No volver a mostrar este aviso",
		externalLinkCancel: "Cancelar",
		externalLinkContinue: "Continuar",
	},
	en: {
		// Header
		appName: "isPep",
		byJanovix: "Janovix",
		appDescription: "Politically Exposed Persons Verification",

		// Loading
		loading: "Loading...",

		// Hero
		heroTitle: "PEP Verification for Compliance",
		heroDescription:
			"Check if an individual is or has been a Politically Exposed Person. Our tool verifies multiple national and international databases.",

		// Search Form
		searchPlaceholder: "Enter the full name of the individual...",
		searchButton: "Verify PEP",
		searchIndividualPlaceholder: "SEARCH INDIVIDUAL...",
		searchCompanyPlaceholder: "SEARCH COMPANY...",

		// Home / search welcome
		homeTitle: "Watchlist",
		homeSubtitle:
			"Screen individuals and companies against sanctions, PEP, and adverse media lists in one workflow.",
		tourStep1Title: "Subject type",
		tourStep1Desc:
			"Toggle between Individual and Company to match the subject you are screening.",
		tourStep2Title: "Search field",
		tourStep2Desc:
			"Type the full legal name in uppercase (minimum 4 characters).",
		tourStep3Title: "Advanced settings",
		tourStep3Desc:
			"Open the settings control to add birth or incorporation date, identifiers (RFC, CURP, etc.), or countries to cut down homonym false positives.",
		tourStep4Title: "Run the search",
		tourStep4Desc: "Press the arrow button or hit Enter to start the query.",
		tourNext: "Next",
		tourPrev: "Previous",
		tourDone: "Done",
		tourProgress: "{{current}} of {{total}}",

		// Recent Searches / Queries
		recentSearches: "Recent queries",
		noRecentSearches: "No recent queries",
		noRecentSearchesDescription:
			"Start your first PEP verification to see your queries here.",
		startFirstSearch: "Start first query",
		newQuery: "New Query",
		viewAllQueries: "View all queries",

		// Loading View
		verifyingIdentity: "Verifying identity",
		searching: "Searching:",
		progress: "Progress",
		timeElapsed: "Time elapsed:",
		loadingWarning:
			"Do not refresh or leave this page. The query may take up to one minute while multiple databases are being verified.",
		important: "Important:",

		// Loading Steps
		step1: "Connecting to national databases...",
		step2: "Querying international records...",
		step3: "Checking sanctions lists...",
		step4: "Analyzing matches...",
		step5: "Generating report...",

		// Result View
		isPep: "Is PEP",
		isNotPep: "Not PEP",
		isPepDescription:
			"This person is or has been a Politically Exposed Person.",
		isNotPepDescription:
			"No records of this individual were found in the consulted databases.",
		yes: "Yes",
		no: "No",
		searchInfo: "Search information",
		searchedName: "Searched name:",
		queryDate: "Query date:",
		queryId: "Query ID:",
		newSearch: "Perform another search",
		exportPdf: "Export to PDF",
		exportingPdf: "Generating PDF...",
		pdfScreeningReport: "Screening Report",
		pdfSubject: "Subject",
		pdfEntityType: "Type",
		pdfDate: "Date",
		pdfStatus: "Status",
		pdfBirthDate: "Birth date",
		pdfQueryId: "ID",
		pdfClean: "Clean",
		pdfMatches: "Matches",
		pdfError: "Error",
		pdfDisabled: "Disabled",
		pdfNoMatches: "No matches found",
		pdfMatchesFound: "match(es)",
		pdfGeneratedAt: "Generated",
		pdfPoweredBy: "Powered by",
		pdfProbability: "Probability",
		pdfRiskLevel: "Risk level",
		pdfScore: "Score",
		pdfName: "Name",
		pdfDataset: "List",
		pdfRisk: "Risk",
		noData: "No data",
		na: "N/A",

		pepRecordDetails: "PEP record details",
		dataset: "Dataset",
		recordId: "Record ID",
		registeredName: "Registered name",
		aliases: "Aliases",
		birthDate: "Birth date",
		countries: "Countries",
		firstSeen: "First seen",
		lastChange: "Last change",
		lastSeen: "Last seen",
		noAliases: "No aliases",
		noCountries: "No countries",

		// Theme
		themeLabel: "Theme",
		themeSystem: "System",
		themeLight: "Light",
		themeDark: "Dark",
		// Language
		languageLabel: "Language",

		profile: "My profile",
		settings: "Settings",
		help: "Help & support",
		notifications: "Notifications",
		logout: "Log out",

		// Subscription banner
		subscriptionFreeTier: "Free Plan",
		subscriptionFreeTierDesc:
			"You're using the free plan with limited searches.",
		subscriptionNearLimit: "Near limit",
		subscriptionNearLimitDesc: "You're approaching your {metrics} limit.",
		subscriptionLimitReached: "Limit reached",
		subscriptionLimitReachedDesc:
			"You've reached your {metrics} limit. Upgrade to continue.",
		"subscription.noWatchlistAccess.title": "Watchlist Access Not Available",
		"subscription.noWatchlistAccess.description":
			"Your current subscription does not include access to the Watchlist product.",
		"subscription.noWatchlistAccess.upgradePrompt":
			"To access watchlist queries, subscribe to a plan that includes Watchlist.",
		"subscription.noWatchlistAccess.upgradeCta": "View available plans",
		"subscription.noWatchlistAccess.backToSettings": "Go to settings",
		subscriptionUpgrade: "Upgrade plan",
		subscriptionMetricNotices: "notices",
		subscriptionMetricUsers: "users",
		subscriptionMetricAlerts: "searches",
		subscriptionMetricTransactions: "transactions",

		// Error pages
		errorNotFoundTitle: "Page not found",
		errorNotFoundDescription:
			"The page you're looking for doesn't exist or has been moved. Check the URL or navigate back to safety.",
		errorServerTitle: "Something went wrong",
		errorServerDescription:
			"We hit an unexpected error while loading this page.",
		errorServerHelp: "Try again, or return home if the problem persists.",
		errorUnauthorizedTitle: "Sign in required",
		errorUnauthorizedDescription: "You need to sign in to access this page.",
		errorUnauthorizedReason:
			"If you arrived here from a bookmark or shared link, sign in and try again.",
		errorForbiddenTitle: "Access denied",
		errorForbiddenDescription: "You don't have access to this page.",
		errorForbiddenReason:
			"This can happen if your role doesn't include this permission or your access was revoked.",
		errorGoBack: "Go back",
		errorHome: "Home",
		errorTryAgain: "Try again",
		errorSignIn: "Sign in",
		errorRateLimitTitle: "Too many requests",
		errorRateLimitDescription:
			"We're receiving too many requests from your IP. Please wait {seconds} seconds.",
		errorRateLimitDescriptionReady: "You can try again now.",
		errorRateLimitRetry: "Retry",

		// Common additions
		dismiss: "Dismiss",
		privacy: "Privacy",
		terms: "Terms",
		backToQueries: "Back to Queries",
		backToHome: "Back to Home",
		openCalendar: "Open calendar",

		// Search form advanced
		advancedSearch: "Advanced search",
		hideAdvancedSearch: "Hide advanced search",
		identifiersLabel: "Identifiers (comma-separated)",
		identifiersPlaceholder: "RFC, CURP, etc.",
		birthDateLabel: "Birth date (YYYY-MM-DD)",
		dateOfCreationLabel: "Date of creation (YYYY-MM-DD)",
		countriesLabel: "Countries",
		countriesPlaceholder: "MX, US, CO... (ISO codes comma-separated)",
		countriesPlaceholderSelect: "Select countries...",

		// Watchlist search results
		matchesFound: "{count} matches found",
		noMatchesFound: "No matches found",
		noMatchesDescription:
			"No records matching the search criteria were found in the consulted databases.",
		highestScore: "Highest match:",
		score: "Score",
		scoreBreakdown: "Score breakdown",
		vectorScore: "Semantic similarity",
		nameScore: "Name similarity",
		metaScore: "Metadata match",
		identifierMatch: "Exact identifier match",
		highMatch: "High match",
		mediumMatch: "Medium match",
		lowMatch: "Low match",
		viewDetails: "View details",
		hideDetails: "Hide details",
		matchDetails: "Match details",
		searchResultsFor: "Search results for",
		searchNotFound: "Search not found",
		searchFailed: "Search failed",

		// PEP Results
		pepResultsTitle: "PEP Results (Official Sources)",
		pepSearching: "Searching Official Sources...",
		pepError: "Error searching PEP:",
		pepResultsCount: "{count} results found",
		pepResultsCached: "{count} results found (cached)",
		pepNoResults: "No results found in Official Sources",
		pepInstitution: "Institution:",
		pepPosition: "Position:",
		pepArea: "Area:",
		pepState: "Federal Entity:",
		pepPeriod: "Period:",
		ofacResultsTitle: "OFAC Results ({count})",
		sat69bResultsTitle: "SAT 69-B Results ({count})",
		noOfacResults: "No matches found in the OFAC list.",
		noSat69bResults: "No matches found in the SAT 69-B list.",
		unscResultsTitle: "UN Results ({count})",
		noUnscResults: "No matches found in the UN sanctions list.",
		taxpayerStatus: "Taxpayer Status",
		unknownName: "Unknown",
		showDetails: "Show details",
		identifiers: "Identifiers",
		addresses: "Addresses",
		sanctions: "Sanctions",

		// Query History page
		queryHistoryTitle: "Query History",
		queryHistoryDescription: "View and manage your past background checks",
		searchQueriesPlaceholder: "Search queries...",
		filterAll: "All",
		filterIndividual: "Individual",
		filterCompany: "Company",
		tableQuery: "Query",
		tableType: "Type",
		tableSource: "Source",
		tableUser: "User",
		tableDate: "Date",
		tableStatus: "Status",
		tableRiskIndicators: "Risk indicators",
		riskIndicatorOfac: "OFAC: matches found",
		riskIndicatorUnsc: "UNSC: matches found",
		riskIndicatorSat69b: "SAT 69-B/EFOS: matches found",
		riskIndicatorPep: "PEP: matches found",
		riskIndicatorAdverseMedia: "Adverse media: risk detected",
		riskIndicatorNone: "No indicators",
		sourceManual: "Search",
		sourceAmlScreening: "AML Screening",
		sourceWatchlistQuery: "Watchlist query",
		sourceAml: "AML",
		sourceCsvImport: "CSV import",
		sourceApi: "API",
		sourceUnknown: "Unknown",
		userImportLabel: "Import",
		noQueriesFound: "No queries found matching your filters",
		noQueriesYet:
			"No queries yet. Start by searching for an individual or company.",
		showingQueries: "Showing {from} to {to} of {total} queries",
		previous: "Previous",
		next: "Next",

		// Organization picker
		organizations: "Organizations",
		switchOrganization: "Switch organization",
		myOrganizations: "My organizations",
		memberOf: "Member of",
		createOrganization: "Create organization",
		orgSettings: "Settings",
		orgLimitReached: "Organization limit reached",

		// Status labels
		statusPending: "Pending",
		statusRunning: "Processing",
		statusCompleted: "Completed",
		statusFailed: "Failed",
		statusPartial: "Partial",
		statusSkipped: "Skipped",

		// Screening results
		statusSearching: "Searching...",
		statusClean: "Clean",
		statusMatches: "Matches",
		statusError: "Error",
		statusCompleted2: "Completed",
		liveConnection: "Live",
		processingAsync: "Processing async searches (PEP, Adverse Media)…",

		// Screening section titles
		ofacSanctionsList: "OFAC Sanctions List",
		unSanctionsList: "UN Sanctions List",
		sat69bTitle: "SAT 69-B",
		pepTitle: "Politically Exposed Person (PEP)",
		adverseMediaTitle: "Adverse Media",

		// Screening loading/result messages
		verifyingOfac: "Verifying OFAC list...",
		noOfacMatches: "No matches found in the OFAC list.",
		verifyingUn: "Verifying UN list...",
		noUnMatches: "No matches found in the UN sanctions list.",
		verifyingSat69b: "Verifying SAT 69-B list...",
		noSat69bMatches: "No matches found in the SAT 69-B list.",

		// PEP subsections
		pepOfficialSubtitle: "Official Sources (Official)",
		pepAiSubtitle: "PEP - Internet search",
		searchingPepOfficial: "Searching Official Sources...",
		pepOfficialError: "Error querying the Official Sources",
		pepOfficialNoMatch: "Not identified as PEP in the Official Sources.",
		analyzingAi: "Analyzing with artificial intelligence...",
		pepAiError: "AI detection error",
		pepAiNoMatch: "Not identified as PEP by AI analysis.",
		probability: "Probability:",
		sources: "Sources:",
		institution: "Institution:",
		position: "Position:",
		area: "Area:",

		// Adverse media
		analyzingAdverseMedia: "Analyzing media and public sources...",
		adverseMediaError: "Error analyzing adverse media",
		noAdverseMedia: "No adverse media indicators found.",
		riskLevel: "Risk level:",
		riskLevelNone: "None",
		riskLevelLow: "Low",
		riskLevelMedium: "Medium",
		riskLevelHigh: "High",

		// Legal fine print (footer)
		legalDisclaimerFinePrint: `The results from this tool are for informational and due diligence support purposes only. They do not constitute legal, tax, or compliance advice. Information is provided "as is" without warranty of accuracy, completeness, or timeliness. Official sources (SAT, UIF, OFAC, UN Security Council, and others) are the sole authorities for definitive determinations. A match or flag does not imply wrongdoing, illegality, or legal liability. PEP status, sanctions listings, and adverse media findings are risk indicators that require professional analysis. Name-based screening may produce false positives due to homonyms. You should verify identity using additional data (date of birth, incorporation date, country of origin, or other identifiers). Information is obtained from publicly available sources (official publications, open regulatory databases, and publicly accessible media), in a process analogous to what any person could perform manually. You are solely responsible for compliance decisions and actions taken. Professional judgment and independent verification are required before any adverse action. Results are a point-in-time snapshot; official list statuses (e.g. SAT 69-B) may change—always confirm against the original source. This service is governed by the applicable laws of the United Mexican States.`,

		// Type switch
		individual: "Individual",
		company: "Company",
		individuals: "Individuals",
		companies: "Companies",

		// Info page
		aboutWatchlist: "About Watchlist",
		aboutWatchlistDescription:
			"Background screening and due diligence platform for compliance officers, KYC teams, and business operators in the Mexican market and the USMCA region.",
		whatIsWatchlist: "What is Watchlist?",
		whatIsWatchlistDescription:
			"Watchlist is a background screening tool designed for compliance and KYC officers within organizations, as well as business operators who need to screen clients or associates before conducting business. The platform consolidates multiple public data sources into a single query workflow, enabling informed decision-making at speed.",
		dataSources: "Data Sources",
		howItWorks: "How It Works",
		importantDisclaimer: "Important Disclaimer",
		disclaimerText1:
			"Watchlist is a screening tool that aggregates publicly available data from official government sources. The information provided is for informational purposes only and should not be considered as legal advice or a definitive determination of risk.",
		disclaimerText2:
			"Users are responsible for conducting their own due diligence and verifying information through official channels. Janovix is not liable for decisions made based on the information provided by this platform.",

		// Info page data sources
		ofacSdnDescription:
			"The U.S. Department of the Treasury Office of Foreign Assets Control (OFAC) Specially Designated Nationals and Blocked Persons List (SDN). Includes sanctioned individuals and entities with whom commercial transactions are prohibited under U.S. law.",
		sat69bDescription:
			"Companies that Invoice Simulated Operations (EFOS), published by Mexico's Tax Administration Service (SAT) under Article 69-B of the Federal Fiscal Code. Identifies taxpayers presumed to be involved in issuing invoices covering non-existent operations.",
		unSanctionsDescription:
			"United Nations Security Council Consolidated Sanctions List. Includes individuals and entities subject to sanctions measures imposed by the UN Security Council.",
		pepDatabaseDescription:
			"Politically Exposed Persons (PEP) database from Mexican government Official Sourcess. Identifies individuals holding or having held prominent public positions.",

		// Info page how it works
		howItWorksStep1Title: "1. Enter Search Query",
		howItWorksStep1Description:
			"Enter the name of an individual or company you want to screen. You can optionally provide additional information like birth date, identifiers (RFC, CURP), or country of origin to improve matching accuracy.",
		howItWorksStep2Title: "2. Hybrid Search Algorithm",
		howItWorksStep2Description:
			"Our system performs a hybrid search combining exact identifier matching, semantic vector search, and Jaro-Winkler name similarity scoring across all data sources simultaneously. This ensures high accuracy while catching variations in names and spellings.",
		howItWorksStep3Title: "3. Review Results",
		howItWorksStep3Description:
			"Results are organized by data source (OFAC, SAT 69-B, UNSC, PEP) with match scores and detailed information for each hit. You can review the full details of each match to make informed decisions about your due diligence process.",

		// External link dialog
		externalLinkTitle: "Redirect to external site",
		externalLinkDescription: "You will be redirected to a third-party website.",
		externalLinkBody:
			"This site is not under the control of Janovix and may have its own privacy policies and terms of use.",
		externalLinkVisiting: "You are about to visit",
		externalLinkDontShowAgain: "Don't show this warning again",
		externalLinkCancel: "Cancel",
		externalLinkContinue: "Continue",
	},
};

export function getLocaleForLanguage(lang: Language): string {
	switch (lang) {
		case "es":
			return "es-ES";
		case "en":
			return "en-US";
	}
}

export function detectBrowserLanguage(): Language {
	if (typeof navigator === "undefined") return "es";

	const browserLang = navigator.language.toLowerCase();

	if (browserLang.startsWith("es")) return "es";
	if (browserLang.startsWith("en")) return "en";

	return "es";
}
