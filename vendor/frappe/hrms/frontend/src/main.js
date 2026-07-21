import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { initSocket } from "./socket"

import {
	Button,
	Input,
	setConfig,
	frappeRequest,
	resourcesPlugin,
	FormControl,
} from "frappe-ui"
import {
	getSquareLanguage,
	setSquareLanguage,
	squareLanguageOptions,
	translationsPlugin,
} from "./plugins/translationsPlugin.js"
import EmptyState from "@/components/EmptyState.vue"

import { IonicVue } from "@ionic/vue"

import { session } from "@/data/session"
import { userResource } from "@/data/user"
import { employeeResource } from "@/data/employee"

import dayjs from "@/utils/dayjs"
import getIonicConfig from "@/utils/ionicConfig"

import FrappePushNotification from "../public/frappe-push-notification"

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css"

/* Theme variables */
import "./theme/variables.css"

import "./main.css"

const app = createApp(App)
const socket = initSocket()

setConfig("resourceFetcher", frappeRequest)
app.use(resourcesPlugin)
app.use(translationsPlugin)

app.component("Button", Button)
app.component("Input", Input)
app.component("FormControl", FormControl)
app.component("EmptyState", EmptyState)

app.use(router)
app.use(IonicVue, getIonicConfig())

if (session?.isLoggedIn && !employeeResource?.data) {
	employeeResource.reload()
}

app.provide("$session", session)
app.provide("$user", userResource)
app.provide("$employee", employeeResource)
app.provide("$socket", socket)
app.provide("$dayjs", dayjs)

const registerServiceWorker = async () => {
	window.frappePushNotification = new FrappePushNotification("hrms")

	if ("serviceWorker" in navigator) {
		let serviceWorkerURL = "/assets/hrms/frontend/sw.js"
		let config = ""

		try {
			config = await window.frappePushNotification.fetchWebConfig()
			serviceWorkerURL = `${serviceWorkerURL}?config=${encodeURIComponent(
				JSON.stringify(config)
			)}`
		} catch (err) {
			console.error("Failed to fetch FCM config", err)
		}

		navigator.serviceWorker
			.register(serviceWorkerURL, {
				type: "classic",
			})
			.then((registration) => {
				if (config) {
					window.frappePushNotification.initialize(registration).then(() => {
						console.log("Frappe Push Notification initialized")
					})
				}
			})
			.catch((err) => {
				console.error("Failed to register service worker", err)
			})
	} else {
		console.error("Service worker not enabled/supported by the browser")
	}
}

const mountLanguageSwitcher = () => {
	let switcher = document.querySelector(".square-hrm-app-language-switcher")
	if (!switcher) {
		switcher = document.createElement("div")
		switcher.className = "square-hrm-app-language-switcher"
		switcher.setAttribute("role", "group")
		document.body.appendChild(switcher)
	}

	const language = getSquareLanguage()
	switcher.setAttribute("aria-label", language === "vi" ? "Ngôn ngữ" : "Language")
	switcher.innerHTML = ""

	for (const option of squareLanguageOptions) {
		const button = document.createElement("button")
		button.type = "button"
		button.className = `square-hrm-app-language-switcher__button${
			option.code === language ? " is-active" : ""
		}`
		button.setAttribute("aria-pressed", option.code === language ? "true" : "false")
		button.setAttribute("title", option.label)
		button.textContent = option.shortLabel
		button.addEventListener("click", () => {
			if (option.code === getSquareLanguage()) return
			setSquareLanguage(option.code)
			const url = new URL(window.location.href)
			url.searchParams.set("_lang", option.code)
			window.location.assign(url.toString())
		})
		switcher.appendChild(button)
	}
}

router.isReady().then(async () => {
	if (import.meta.env.DEV) {
		await frappeRequest({
			url: "/api/method/hrms.www.hrms.get_context_for_dev",
		}).then(async (values) => {
			if (!window.frappe) window.frappe = {}
			window.frappe.boot = values
		})
	}

	await translationsPlugin.isReady();
	registerServiceWorker()
	app.mount("#app")
	mountLanguageSwitcher()
})

router.beforeEach(async (to, _, next) => {
	let isLoggedIn = session.isLoggedIn

	try {
		if (isLoggedIn) await userResource.reload()
	} catch (error) {
		isLoggedIn = false
	}

	if (!isLoggedIn) {
		// password reset page is outside the PWA scope
		if (to.path === "/update-password") {
			return next(false)
		} else if (to.name !== "Login") {
			next({ name: "Login" })
		}
	}

	if (isLoggedIn && to.name !== "InvalidEmployee") {
		await employeeResource.promise
		// user should be an employee to access the app
		// since all views are employee specific
		if (
			!employeeResource?.data ||
			employeeResource?.data?.user_id !== userResource.data.name
		) {
			next({ name: "InvalidEmployee" })
		} else if (to.name === "Login") {
			next({ name: "Home" })
		} else {
			next()
		}
	} else {
		next()
	}
})
