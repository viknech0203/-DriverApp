# DriverApp

**DriverApp** — мобильное приложение для водителей, часть программного комплекса для автоматизации работы автотранспорта. Приложение предоставляет водителям доступ к задачам, рейсам, документации и статусам в режиме реального времени.

## Описание проекта

DriverApp заменяет устаревший веб‑модуль, который использовался через браузер. Приложение позволяет водителям:

- Получать задание с рейсом и статусами.
- Изменять статус работы (выехал, на погрузке, завершено и т.д.).
- Сохранять и просматривать документы (путевые листы, тахографы, права и т.д.).

## Быстрый старт

### 1. Клонировать репозиторий

\`\`\`bash
git clone https://github.com/YourOrg/DriverApp.git
cd DriverApp
\`\`\`

### 2. Установить зависимости

\`\`\`bash
yarn install
# или
npm install
\`\`\`

### 3. Запуск проекта

\`\`\`bash
expo start
\`\`\`

Или откройте проект в Android/iOS‑эмуляторе.

## Структура приложения

- **AuthScreen** — экран авторизации с JWT токеном.  
- **FlightInfoScreen** — информация о рейсе (детали маршрута и назначения).  
- **FlightStatus** — выбор и изменение статуса рейса (выехал, на погрузке, завершено и т.д.).  
- **AppHeader** — глобальный хедер с меню навигации и пользовательским профилем.  

## Технологии

- **React Native** — для разработки мобильного приложения.  
- **PostgreSQL** — для хранения данных и логики.  
- **JWT** — для аутентификации и безопасности.  
- **REST API** — для взаимодействия между мобильным приложением и сервером.  

## Требования

- Node.js ≥ 14.x  
- npm ≥ 6.x  
- Expo CLI (или React Native CLI для сборки приложения)  

## Как вносить изменения

1. Создайте новую ветку: \`feature/имя‑фичи\`.  
2. Пишите код и добавляйте необходимые тесты.  
3. Оформите Pull Request в основную ветку (\`main\`).  
4. После ревью и тестирования изменения будут замержены.  

## Тестирование

- Для unit‑тестов используйте [Jest](https://jestjs.io/).  
- Для энд‑ту‑энд‑тестирования можно использовать [Cypress](https://www.cypress.io/).  

## Лицензия

Этот проект лицензирован под MIT. См. файл [LICENSE](LICENSE) для подробностей.
