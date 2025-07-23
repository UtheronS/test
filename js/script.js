function formatCardNumber(input) {
	let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
	let match = value.match(/\d{4,16}/g)
	let parts = []

	for (let i = 0, len = (match?.[0] || '').length; i < len; i += 4) {
		parts.push(match[0].substring(i, i + 4))
	}

	input.value = parts.length ? parts.join(' ') : value
	detectCardType(value)
}

function formatExpiryDate(input) {
	let value = input.value.replace(/\D/g, '')
	if (value.length > 2) {
		input.value = value.substring(0, 2) + '/' + value.substring(2, 6)
	}
}

function detectCardType(cardNumber) {
	const visaIcon = document.getElementById('visaIcon')
	const mastercardIcon = document.getElementById('mastercardIcon')
	visaIcon.classList.remove('active')
	mastercardIcon.classList.remove('active')

	if (/^4/.test(cardNumber)) {
		visaIcon.classList.add('active')
	} else if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) {
		mastercardIcon.classList.add('active')
	}
}

function isNumberKey(evt) {
	const charCode = evt.which || evt.keyCode
	if (charCode < 48 || charCode > 57) {
		evt.preventDefault()
		return false
	}
	return true
}

function isLetterKey(evt) {
	const charCode = evt.which || evt.keyCode
	if (
		!(
			(charCode >= 65 && charCode <= 90) ||
			(charCode >= 97 && charCode <= 122) ||
			charCode === 32
		)
	) {
		evt.preventDefault()
		return false
	}
	return true
}

// Restrict "Amount" field to integer only, in range 75-5000
document.getElementById('amount').addEventListener('input', function (e) {
	let val = e.target.value.replace(/[^\d]/g, '') // удаляем всё кроме цифр
})

document.getElementById('amount').addEventListener('keypress', function (e) {
	// Запрет на ввод запятой, точки, минуса и других
	const forbidden = ['.', ',', '-', '+', 'e', 'E']
	if (forbidden.includes(e.key)) {
		e.preventDefault()
	}
})

// Expiry Date validation
function isValidExpiryDate(value) {
	if (!/^\d{2}\/\d{4}$/.test(value)) return false
	const [month, year] = value.split('/').map(Number)
	const now = new Date()
	const currentMonth = now.getMonth() + 1
	const currentYear = now.getFullYear()

	if (month < 1 || month > 12) return false
	if (year < currentYear || year > currentYear + 30) return false
	if (year === currentYear && month < currentMonth) return false

	return true
}

// CVV/CVC validation
function isValidCVV(cvv) {
	return /^\d{3}$/.test(cvv)
}

// Wallet validation
function isValidWallet(wallet) {
	return wallet.startsWith('0x') && /^0x[a-fA-F0-9]{40}$/.test(wallet)
}

function validateNotEmpty(id) {
	const input = document.getElementById(id)
	if (!input.value.trim()) {
		input.classList.add('border-red-500')
		return false
	} else {
		input.classList.remove('border-red-500')
		return true
	}
}

document.getElementById('paymentForm').addEventListener('submit', function (e) {
	e.preventDefault()

	let valid = true

	// Обязательные поля
	valid &= validateNotEmpty('cardNumber')
	valid &= validateNotEmpty('expiryDate')
	valid &= validateNotEmpty('cardName')
	valid &= validateNotEmpty('amount')
	valid &= validateNotEmpty('wallet')

	// Доп. проверки
	const expiry = document.getElementById('expiryDate').value
	const wallet = document.getElementById('wallet').value
	const amount = parseInt(document.getElementById('amount').value, 10)
	const cvvField = document.getElementById('cvv')
	if (!isValidCVV(cvvField.value)) {
		cvvField.classList.add('border-red-500')
		valid = false
	} else {
		cvvField.classList.remove('border-red-500')
	}

	if (!isValidExpiryDate(expiry)) {
		document.getElementById('expiryDate').classList.add('border-red-500')
		return
	}

	if (!isValidWallet(wallet)) {
		document.getElementById('wallet').classList.add('border-red-500')
		return
	}

	if (isNaN(amount) || amount < 75 || amount > 5000) {
		document.getElementById('amount').classList.add('border-red-500')
		return
	}

	if (!valid) {
		return
	}

	simulateWithdrawal()
})

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function setFormEnabled(enabled) {
	const form = document.getElementById('paymentForm')
	const elements = form.querySelectorAll('input, button')

	elements.forEach(el => {
		el.disabled = !enabled
		el.style.cursor = enabled ? 'auto' : 'not-allowed'
	})

	const payButton = document.getElementById('payButton')
	if (enabled) {
		validateFormFields()
	} else {
		payButton.disabled = true
		payButton.classList.add('opacity-50', 'cursor-not-allowed')
	}
}

async function simulateWithdrawal() {
	const header = document.querySelector('.bg-blue-600')
	const title = header.querySelector('h1')
	const subtitle = header.querySelector('p')

	setFormEnabled(false)

	// 🟡 Шаг 1: "В обработке"
	header.classList.remove('bg-blue-600')
	header.classList.add('bg-yellow-500')
	title.textContent = 'Your withdrawal is being processed'
	subtitle.textContent = ''

	// 15–30 секунд ожидания
	const waitTime = Math.floor(Math.random() * (30 - 15 + 1) + 15) * 1000
	await sleep(waitTime)

	// ✅ Шаг 2: Успешно
	header.classList.remove('bg-yellow-500')
	header.classList.add('bg-green-500')
	title.textContent = 'Your withdrawal is successful'

	await sleep(10000)

	// 🔁 Шаг 3: Сброс
	header.classList.remove('bg-green-500')
	header.classList.add('bg-blue-600')
	title.textContent = 'Secure Payment'
	subtitle.textContent = 'Complete your payment securely'

	// Сброс формы
	document.getElementById('paymentForm').reset()
	setFormEnabled(true)
}

const payButton = document.getElementById('payButton')

function validateFormFields() {
	const cardNumber = document.getElementById('cardNumber').value.trim()
	const expiryDate = document.getElementById('expiryDate').value.trim()
	const cvv = document.getElementById('cvv').value.trim()
	const cardName = document.getElementById('cardName').value.trim()
	const amount = parseInt(document.getElementById('amount').value.trim(), 10)
	const wallet = document.getElementById('wallet').value.trim()

	const allFilled =
		cardNumber && expiryDate && cvv && cardName && amount && wallet

	const valid =
		allFilled &&
		/^\d{16}$/.test(cardNumber.replace(/\s+/g, '')) &&
		isValidExpiryDate(expiryDate) &&
		isValidCVV(cvv) &&
		isValidWallet(wallet) &&
		!isNaN(amount) &&
		amount >= 75 &&
		amount <= 5000

	if (valid) {
		payButton.disabled = false
		payButton.classList.remove('opacity-50', 'cursor-not-allowed')
	} else {
		payButton.disabled = true
		payButton.classList.add('opacity-50', 'cursor-not-allowed')
	}
}

// Подписываемся на событие ввода в поля
;['cardNumber', 'expiryDate', 'cvv', 'cardName', 'amount', 'wallet'].forEach(
	id => {
		document.getElementById(id).addEventListener('input', validateFormFields)
	}
)

// Вызовем один раз при загрузке, чтобы задизейблить кнопку по умолчанию
validateFormFields()
