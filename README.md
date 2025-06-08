# StatPilot

**StatPilot** is a web application that predicts NBA player prop outcomes—such as points, rebounds, and assists—using historical player performance data. It provides probabilities that a player will go over or under a given stat line against specific opponents.

🌐 **Live Demo**: [https://statpilot-6cg9.onrender.com/](https://statpilot-6cg9.onrender.com/)

---

## Project Overview

StatPilot leverages a **linear regression model** trained on recent game data to estimate player performance. The model incorporates:

- Opponent-specific averages
- Season-long averages
- Recent game averages (rolling window)

Using these features, it predicts the expected stat value and calculates the probability of exceeding or falling below user-defined stat lines, assuming a normal distribution of performance.

---

## Backend Architecture

- Built with **FastAPI** serving both API endpoints and frontend HTML pages.
- Reads and cleans an NBA dataset (`LeGamble_Dataset - Sheet1.csv`).
- Core prediction logic in `get_stat_probability`:
  - Filters player data by opponent and stat category.
  - Fits a linear regression model on opponent, season, and recent averages.
  - Adjusts predictions based on data availability and variability.
  - Returns detailed stats and probability estimates.
- API endpoints:
  - `/` — homepage
  - `/stats` — main dashboard
  - `/chart` — chart visualization
  - `/input` — accepts user inputs and returns prediction JSON.

---

## Frontend Details

- Static assets (images, CSS) served from `/static`.
- HTML pages rendered by FastAPI and display the interactive UI.
- User input forms send requests to the backend `/input` endpoint to fetch prediction results dynamically.

---

## Technologies Used

- Python 3.9
- FastAPI
- Uvicorn
- Pandas & NumPy
- Scikit-learn (Linear Regression)
- SciPy (statistical functions)
- Docker (containerization)

---

## Deployment

StatPilot is deployed as a live web application using Docker, allowing seamless scaling and easy access for users without requiring local setup.

🌍 **Check it out live**: [https://statpilot-6cg9.onrender.com/](https://statpilot-6cg9.onrender.com/)
