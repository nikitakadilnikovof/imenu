const url = new URLSearchParams(window.location.search)
const tableNumber = url.get('table')
localStorage.setItem('tableNumber', tableNumber)