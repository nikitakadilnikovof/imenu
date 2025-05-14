
// Функция fetchDishesList выполняет HTTP-запрос для получения данных о блюдах
export function fetchDishesList() {
    // Выполняем fetch-запрос к указанному URL
    return fetch('https://script.google.com/macros/s/AKfycbwzvkz39BzVzyY4ckMQ_b77b9a0u0rO90XM-cjQ_lIP85SJ1lWmkvZtgT6jI9vbaV1yzA/exec')
      .then(response => {
        // Проверяем, успешен ли ответ
        if (!response.ok) {
          // Если ответ не успешен, выбрасываем ошибку с кодом статуса
          throw new Error('Сеть ответила с ошибкой: ' + response.status);
        }
        // Преобразуем ответ в JSON
        return response.json();
      })
      .then(data => {
        // Обрабатываем полученные данные и возвращаем массив объектов
        return processData(data);
      })
      .catch(error => {
        // Обрабатываем ошибки, которые могут возникнуть при выполнении запроса
        console.error('Ошибка:', error);
        // Возвращаем пустой массив в случае ошибки
        return [];
      });
  }
  
  // Функция processData преобразует данные из массива массивов в массив объектов
  function processData(data) {
    // Первая строка данных используется как названия полей
    const keys = data[0];
    // Преобразуем каждую последующую строку в объект
    const objectsArray = data.slice(1).map(row => { 
      let obj = {};
      // Заполняем объект, сопоставляя значения с ключами
      row.forEach((value, index) => {
        obj[keys[index]] = value;
      });
  
      return obj;
    });
    // Возвращаем массив объектов
    return objectsArray;
  }