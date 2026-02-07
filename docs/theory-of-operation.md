# Weekly Menu Planner - Theory of Operation

The Weekly Menu Planner is a web application designed to help users plan their meals for the week. It allows users to create a personalized meal plan, generate a shopping list based on the planned meals, and manage their dietary preferences and restrictions. The application helps users hit their macro targets for daily intake.

## Key Features

Weekly Menu Planner is an AI first application. The goal is to use a modern large language model to generate meal plans and shopping lists based on the user input. 

Users provide their preferences (e.g., dietary restrictions, favorite cuisines, and specific meals they want to include) as well as macro goals (protein, carbohydrates, fats, and fiber). The application then generates a meal plan that meets these criteria and provides a corresponding shopping list.

It should have explicit options to not repeat any meals from the previous week, as long as free text input to allow the user to specify any added context for the AI to use.

## Architecture

The application is built using a client-server architecture. The frontend is developed using React, providing a responsive and user-friendly interface for meal planning and shopping list management. The backend is implemented using Node.js and Express, handling API requests, user authentication, and interactions with the AI model. 

All of it should be containerized using Docker, allowing for easy deployment and scalability. The application should be structured such that it could be hosted in a cloud platform, but given the Docker containerization, it can also be run locally on the user's machine with Docker installed.

All functionality should have tests, including unit tests, integration tests, and end-to-end tests to ensure the reliability and correctness of the application. The testing framework should be chosen based on the technology stack used for the frontend and backend development.

GitHub Actions to make sure tests and linting are run on every pull request need to exist.

## AI Integration

The AI integration is a core component of the Weekly Menu Planner. The application will utilize a large language model (LLM) to generate meal plans and shopping lists based on user input. The LLM will be trained on a diverse dataset of recipes, dietary information, and nutritional data to ensure it can provide accurate and personalized meal plans.

The AI will take into account the user's dietary preferences, restrictions, and macro goals to create a meal plan that meets their needs. It will also generate a shopping list that includes all the ingredients required for the planned meals, making it easier for users to shop for their groceries.

The application should use OpenAI 5.2 or later. The API key should be stored securely and deployed as a secret during the deployment process. 

The AI interaction should be done as general as possible to easily allow for upgrading models, within reason.

## UX

The UX should be clean and modern, but with color. The macro input areas should be visually distinct and clear. There needs to be way to save the grocery list to Markdown or copy to the clipboard. The meal plan should be visually distinct from the shopping list. The free text area should be near the macro input. Generally, the inputs should be on the top and the outputs on the bottom. 

The meal plan should make clear what is for breakfast, lunch, dinner, and morning and afternoon snacks each day. The shopping list should be organized by category (e.g., produce, dairy, meat, etc.) and aggregate ingredients across all meals to make it easier for users to shop.

## Development Actions

Make sure to save off these preferences for any future development interacting with Copilot.
- Always create tests for any new features added or bugs fixed
- Always update the README.md with any new features or changes to existing features.