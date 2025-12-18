export type Language = "pt" | "es" | "en";

export const translations = {
	pt: {
		// Header
		appName: "isPep",
		byJanovix: "Janovix",
		appDescription: "Verificação de Pessoas Politicamente Expostas",

		// Loading
		loading: "Carregando...",

		// Hero
		heroTitle: "Verificação PEP para Compliance",
		heroDescription:
			"Consulte se um indivíduo é ou foi uma Pessoa Politicamente Exposta. Nossa ferramenta verifica múltiplas bases de dados nacionais e internacionais.",

		// Search Form
		searchPlaceholder: "Digite o nome completo do indivíduo...",
		searchButton: "Verificar PEP",

		// Recent Searches
		recentSearches: "Pesquisas recentes",
		noRecentSearches: "Nenhuma pesquisa recente",
		noRecentSearchesDescription:
			"Comece sua primeira verificação PEP para ver suas pesquisas aqui.",
		startFirstSearch: "Fazer primeira pesquisa",

		// Loading View
		verifyingIdentity: "Verificando identidade",
		searching: "Pesquisando:",
		progress: "Progresso",
		timeElapsed: "Tempo decorrido:",
		loadingWarning:
			"Não atualize nem saia desta página. A consulta pode demorar até um minuto enquanto verificamos múltiplas bases de dados.",
		important: "Importante:",

		// Loading Steps
		step1: "Conectando com bases de dados nacionais...",
		step2: "Consultando registros internacionais...",
		step3: "Verificando listas de sanções...",
		step4: "Analisando coincidências...",
		step5: "Gerando relatório...",

		// Result View
		isPep: "É PEP",
		isNotPep: "Não é PEP",
		isPepDescription: "Esta pessoa é ou foi uma Pessoa Politicamente Exposta.",
		isNotPepDescription:
			"Não foram encontrados registros deste indivíduo nas bases de dados consultadas.",
		yes: "Sim",
		no: "Não",
		searchInfo: "Informações da pesquisa",
		searchedName: "Nome pesquisado:",
		queryDate: "Data da consulta:",
		queryId: "ID da consulta:",
		newSearch: "Realizar outra pesquisa",
		exportPdf: "Exportar para PDF",
		noData: "Sem dados",
		na: "N/A",

		pepRecordDetails: "Detalhes do registro PEP",
		dataset: "Base de dados",
		recordId: "ID do registro",
		registeredName: "Nome registrado",
		aliases: "Aliases",
		birthDate: "Data de nascimento",
		countries: "Países",
		firstSeen: "Primeira publicação",
		lastChange: "Última alteração",
		lastSeen: "Última observação",
		noAliases: "Sem aliases",
		noCountries: "Sem países",

		// Theme
		themeSystem: "Sistema",
		themeLight: "Claro",
		themeDark: "Escuro",

		profile: "Meu perfil",
		settings: "Configurações",
		help: "Ajuda e suporte",
		notifications: "Notificações",
		logout: "Sair",
	},
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

		// Recent Searches
		recentSearches: "Búsquedas recientes",
		noRecentSearches: "No hay búsquedas recientes",
		noRecentSearchesDescription:
			"Realiza tu primera verificación PEP para ver tus búsquedas aquí.",
		startFirstSearch: "Realizar primera búsqueda",

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
		step4: "Analizando coincidências...",
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
		themeSystem: "Sistema",
		themeLight: "Claro",
		themeDark: "Oscuro",

		profile: "Mi perfil",
		settings: "Configuración",
		help: "Ayuda y soporte",
		notifications: "Notificaciones",
		logout: "Cerrar sesión",
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

		// Recent Searches
		recentSearches: "Recent searches",
		noRecentSearches: "No recent searches",
		noRecentSearchesDescription:
			"Start your first PEP verification to see your searches here.",
		startFirstSearch: "Start first search",

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
		themeSystem: "System",
		themeLight: "Light",
		themeDark: "Dark",

		profile: "My profile",
		settings: "Settings",
		help: "Help & support",
		notifications: "Notifications",
		logout: "Log out",
	},
};

export function getLocaleForLanguage(lang: Language): string {
	switch (lang) {
		case "pt":
			return "pt-BR";
		case "es":
			return "es-ES";
		case "en":
			return "en-US";
	}
}

export function detectBrowserLanguage(): Language {
	if (typeof navigator === "undefined") return "es";

	const browserLang = navigator.language.toLowerCase();

	if (browserLang.startsWith("pt")) return "pt";
	if (browserLang.startsWith("es")) return "es";
	if (browserLang.startsWith("en")) return "en";

	return "es"; // Default to Spanish
}
