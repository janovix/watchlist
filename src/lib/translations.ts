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
		themeLabel: "Tema",
		themeSystem: "Sistema",
		themeLight: "Claro",
		themeDark: "Escuro",
		// Language
		languageLabel: "Idioma",

		profile: "Meu perfil",
		settings: "Configurações",
		help: "Ajuda e suporte",
		notifications: "Notificações",
		logout: "Sair",

		// Subscription banner
		subscriptionFreeTier: "Plano Gratuito",
		subscriptionFreeTierDesc:
			"Você está usando o plano gratuito com buscas limitadas.",
		subscriptionNearLimit: "Perto do limite",
		subscriptionNearLimitDesc:
			"Você está se aproximando do limite de {metrics}.",
		subscriptionLimitReached: "Limite atingido",
		subscriptionLimitReachedDesc:
			"Você atingiu o limite de {metrics}. Atualize para continuar.",
		subscriptionUpgrade: "Atualizar plano",
		subscriptionMetricNotices: "avisos",
		subscriptionMetricUsers: "usuários",
		subscriptionMetricAlerts: "buscas",
		subscriptionMetricTransactions: "transações",
		"subscription.noWatchlistAccess.title": "Acesso Watchlist Não Disponível",
		"subscription.noWatchlistAccess.description":
			"Sua assinatura atual não inclui acesso ao produto Watchlist.",
		"subscription.noWatchlistAccess.upgradePrompt":
			"Para acessar consultas de listas de vigilância, assine um plano que inclua Watchlist.",
		"subscription.noWatchlistAccess.upgradeCta": "Ver planos disponíveis",
		"subscription.noWatchlistAccess.backToSettings": "Ir para configurações",

		// Error pages
		errorNotFoundTitle: "Página não encontrada",
		errorNotFoundDescription:
			"A página que você procura não existe ou foi movida. Verifique a URL ou volte para um lugar seguro.",
		errorServerTitle: "Algo deu errado",
		errorServerDescription:
			"Encontramos um erro inesperado ao carregar esta página.",
		errorServerHelp:
			"Tente novamente ou volte para o início se o problema persistir.",
		errorUnauthorizedTitle: "Login necessário",
		errorUnauthorizedDescription:
			"Você precisa fazer login para acessar esta página.",
		errorUnauthorizedReason:
			"Se você chegou aqui por um link compartilhado ou favorito, faça login e tente novamente.",
		errorForbiddenTitle: "Acesso negado",
		errorForbiddenDescription: "Você não tem acesso a esta página.",
		errorForbiddenReason:
			"Isso pode acontecer se sua função não incluir essa permissão ou se seu acesso foi revogado.",
		errorGoBack: "Voltar",
		errorHome: "Início",
		errorTryAgain: "Tentar novamente",
		errorSignIn: "Entrar",

		// Common additions
		dismiss: "Descartar",

		// Watchlist search
		advancedSearch: "Pesquisa avançada",
		hideAdvancedSearch: "Ocultar pesquisa avançada",
		identifiersLabel: "Identificadores",
		identifiersPlaceholder: "Passaporte, RFC, NIT... (separados por vírgula)",
		birthDateLabel: "Data de nascimento",
		countriesLabel: "Países",
		countriesPlaceholder: "MX, US, CO... (códigos ISO separados por vírgula)",
		matchesFound: "{count} coincidências encontradas",
		noMatchesFound: "Nenhuma coincidência encontrada",
		noMatchesDescription:
			"Não foram encontrados registros que correspondam aos critérios de pesquisa nas bases de dados consultadas.",
		highestScore: "Maior coincidência:",
		score: "Pontuação",
		scoreBreakdown: "Detalhamento da pontuação",
		vectorScore: "Similaridade semântica",
		nameScore: "Similaridade de nome",
		metaScore: "Correspondência de metadados",
		identifierMatch: "Correspondência exata de identificador",
		highMatch: "Coincidência alta",
		mediumMatch: "Coincidência média",
		lowMatch: "Coincidência baixa",
		viewDetails: "Ver detalhes",
		hideDetails: "Ocultar detalhes",
		matchDetails: "Detalhes da coincidência",
		searchResultsFor: "Resultados de pesquisa para",
		searchNotFound: "Pesquisa não encontrada",
		searchFailed: "Erro ao realizar a pesquisa",

		// PEP Results (Transparency Platform)
		pepResultsTitle: "Resultados PEP (Plataforma de Transparência)",
		pepSearching: "Pesquisando na Plataforma de Transparência...",
		pepError: "Erro ao pesquisar em PEP:",
		pepResultsCount: "Foram encontrados {count} resultados",
		pepResultsCached: "Foram encontrados {count} resultados (em cache)",
		pepNoResults:
			"Não foram encontrados resultados na Plataforma de Transparência",
		pepInstitution: "Instituição:",
		pepPosition: "Cargo:",
		pepArea: "Área:",
		pepState: "Entidade Federativa:",
		pepPeriod: "Período:",
		ofacResultsTitle: "Resultados OFAC ({count})",
		sat69bResultsTitle: "Resultados SAT 69-B ({count})",
		noOfacResults: "Não foram encontradas coincidências na lista OFAC.",
		noSat69bResults: "Não foram encontradas coincidências na lista SAT 69-B.",
		unscResultsTitle: "Resultados ONU ({count})",
		noUnscResults: "Não foram encontradas coincidências na lista da ONU.",
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

		// Common additions
		dismiss: "Descartar",

		// Watchlist search
		advancedSearch: "Búsqueda avanzada",
		hideAdvancedSearch: "Ocultar búsqueda avanzada",
		identifiersLabel: "Identificadores",
		identifiersPlaceholder: "Pasaporte, RFC, NIT... (separados por coma)",
		birthDateLabel: "Fecha de nacimiento",
		countriesLabel: "Países",
		countriesPlaceholder: "MX, US, CO... (códigos ISO separados por coma)",
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

		// PEP Results (Transparency Platform)
		pepResultsTitle: "Resultados PEP (Plataforma de Transparencia)",
		pepSearching: "Buscando en Plataforma de Transparencia...",
		pepError: "Error al buscar en PEP:",
		pepResultsCount: "Se encontraron {count} resultados",
		pepResultsCached: "Se encontraron {count} resultados (cacheados)",
		pepNoResults:
			"No se encontraron resultados en la Plataforma de Transparencia",
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

		// Common additions
		dismiss: "Dismiss",

		// Watchlist search
		advancedSearch: "Advanced search",
		hideAdvancedSearch: "Hide advanced search",
		identifiersLabel: "Identifiers",
		identifiersPlaceholder: "Passport, RFC, NIT... (comma-separated)",
		birthDateLabel: "Birth date",
		countriesLabel: "Countries",
		countriesPlaceholder: "MX, US, CO... (ISO codes comma-separated)",
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

		// PEP Results (Transparency Platform)
		pepResultsTitle: "PEP Results (Transparency Platform)",
		pepSearching: "Searching Transparency Platform...",
		pepError: "Error searching PEP:",
		pepResultsCount: "{count} results found",
		pepResultsCached: "{count} results found (cached)",
		pepNoResults: "No results found in Transparency Platform",
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
