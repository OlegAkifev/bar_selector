let entries = []
let isSpinning = false

document.addEventListener('DOMContentLoaded', async () => {
    await fetchEntries()
    renderEntries()
    renderScroll()
})

async function fetchEntries() {
    const response = await fetch('http://127.0.0.1:5000/entries')
    const data = await response.json()
    entries = data.entries
}

async function addEntry() {
    const input = document.getElementById('entry-input')
    const entry = input.value.trim()
    if (entry) {
        const response = await fetch('http://127.0.0.1:5000/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entry }),
        })
        const data = await response.json()
        entries = data.entries
        renderEntries()
        renderScroll()
        input.value = ''
    }
}

async function deleteEntry(entry) {
    try {
        const response = await fetch('http://127.0.0.1:5000/delete', {
            method: 'DELETE', // Метод HTTP DELETE
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entry }), // Передаем удаляемую запись
        })

        if (response.ok) {
            const data = await response.json()
            entries = data.entries // Обновляем локальный список
            renderEntries() // Перерисовываем список
            renderScroll() // Обновляем прокрутку
        } else {
            console.error('Failed to delete entry on server')
        }
    } catch (error) {
        console.error('Error deleting entry:', error)
    }
}
 

function renderEntries() {
    const list = document.getElementById('entries-list')
    list.innerHTML = entries
        .map(
            entry => `
                <div class="entry-item">
                    <span>${entry}</span>
                    <button class="delete-btn" onclick="deleteEntry('${entry}')">×</button>
                </div>`
        )
        .join('')
}

function renderScroll() {
    const scrollContainer = document.getElementById('entries-scroll')
    scrollContainer.innerHTML = ''

    entries.forEach(entry => {
        const entryElement = document.createElement('div')
        entryElement.classList.add('scroll-entry')
        entryElement.textContent = entry
        scrollContainer.appendChild(entryElement)
    })

    highlightCurrentEntry()
}

function spinWheel() {
    if (isSpinning || entries.length === 0) return
    isSpinning = true

    const scrollContainer = document.getElementById('entries-scroll')
    const entryWidth = scrollContainer.firstElementChild.offsetWidth + 10 // Ширина элемента с отступами
    const spinDuration = Math.random() * 2000 + 9000 // Общее время прокрутки (в миллисекундах)
    const initialSpeed = 70 // Начальная скорость прокрутки (в пикселях за кадр)

    let offset = 0 // Текущее смещение
    let startTime = null // Время начала анимации

    // Плавное движение с замедлением
    function animate(time) {
        if (!startTime) startTime = time // Запоминаем начальное время
        const elapsed = time - startTime

        // Останавливаем прокрутку по истечении времени
        if (elapsed >= spinDuration) {
            scrollContainer.style.transition = 'none'
            // scrollContainer.style.transform = 'translateX(0)' // Сбрасываем трансформацию

            // Определяем текущий подсвеченный элемент
            highlightCurrentEntry()
            const winner = getWinner() // Получаем победителя по положению стрелки

            displayWinner(winner) // Отображаем победителя
            showFireworks() // Запускаем фейерверки
            isSpinning = false
            return
        }

        // Применяем замедление: уменьшаем скорость с течением времени
        const remainingTime = spinDuration - elapsed
        const speed = initialSpeed * (remainingTime / spinDuration) // Уменьшаем скорость пропорционально оставшемуся времени

        // Смещаем колесо
        offset -= speed // Увеличиваем смещение
        scrollContainer.style.transform = `translateX(${offset}px)`

        // Бесшовное вращение: возвращаем элементы, уходящие за левую границу, направо
        if (Math.abs(offset) >= entryWidth) {
            offset += entryWidth // Корректируем смещение
            scrollContainer.appendChild(scrollContainer.firstElementChild) // Переносим первый элемент в конец
        }

        highlightCurrentEntry() // Подсвечиваем текущий элемент
        requestAnimationFrame(animate) // Рекурсивный вызов для плавного обновления
    }

    requestAnimationFrame(animate)
}

function highlightCurrentEntry() {
    const scrollContainer = document.getElementById('entries-scroll')
    const arrowElement = document.getElementById('arrow')
    const arrowRect = arrowElement.getBoundingClientRect()
    const arrowCenter = arrowRect.left + arrowRect.width / 2

    Array.from(scrollContainer.children).forEach(entry => {
        const entryRect = entry.getBoundingClientRect()
        if (entryRect.left <= arrowCenter && entryRect.right >= arrowCenter) {
            entry.classList.add('highlighted')
        } else {
            entry.classList.remove('highlighted')
        }
    })
}

function getWinner() {
    const scrollContainer = document.getElementById('entries-scroll')
    const arrowElement = document.getElementById('arrow')
    const arrowRect = arrowElement.getBoundingClientRect()
    const arrowCenter = arrowRect.left + arrowRect.width / 2

    const targetEntry = Array.from(scrollContainer.children).find(entry => {
        const entryRect = entry.getBoundingClientRect()
        return entryRect.left <= arrowCenter && entryRect.right >= arrowCenter
    })

    return targetEntry ? targetEntry.textContent : null
}

function displayWinner(winner) {
    if (winner) {
        const winnerDisplay = document.getElementById('result')
        winnerDisplay.textContent = `Мы идем в ${winner}`
        winnerDisplay.style.display = 'block'
    }
}

function showFireworks() {
    const fireworksContainer = document.createElement('div')
    fireworksContainer.id = 'fireworks'
    document.body.appendChild(fireworksContainer)

    // Генерируем 120 фейерверков
    for (let i = 0; i < 120; i++) {
        const firework = document.createElement('div')
        firework.classList.add('firework')
        
        // Случайные начальные позиции
        const xPosition = Math.random() * 100 // по горизонтали (0-100vw)
        const yPosition = Math.random() * 100 // по вертикали (0-100vh)

        firework.style.left = `${xPosition}vw`
        firework.style.top = `${yPosition}vh`

        // Случайный цвет для фейерверка
        const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`
        firework.style.backgroundColor = randomColor

        // Случайный размер фейерверка
        const size = Math.random() * 5 + 5 // от 5px до 10px
        firework.style.width = `${size}px`
        firework.style.height = `${size}px`

        fireworksContainer.appendChild(firework)

        // После задержки запускаем анимацию фейерверка
        setTimeout(() => {
            firework.classList.add('explode')
            
            // Удаляем фейерверк через несколько секунд после анимации
            setTimeout(() => {
                firework.remove()
                if (i === 119) fireworksContainer.remove() // Удаляем контейнер после всех фейерверков
            }, 2500) // Фейерверк исчезает после 1.5 секунды (время анимации)
        }, Math.random() * 2000) // Случайная задержка перед началом анимации
    }
}

