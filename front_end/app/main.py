import uvicorn
from fastapi import FastAPI,status, HTTPException,Query
from pydantic import BaseModel
from urllib.request import urlopen
import json
from fastapi import FastAPI, Request, Form                 # The main FastAPI import
from fastapi.responses import Response  
from fastapi.responses import HTMLResponse    # Used for returning HTML responses
from fastapi.staticfiles import StaticFiles   # Used for serving static files
import uvicorn                                # Used for running the app
from fastapi.responses import RedirectResponse

import os

#--------------------------------------------------------------------------------------------#
#--------------------------for cookies and stuff---------------------------------------------#


from typing import Dict
from typing import Annotated, Optional

#--------------------------------------------------------------------------------------------#
#--------------------------      new lib        ---------------------------------------------#
import pandas as pd
import numpy as np
from scipy.stats import norm
from pathlib import Path
from sklearn.linear_model import LinearRegression

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")





def read_html(file_path: str) -> str:
    with open(file_path, "r") as f:
        return f.read()


BASE_DIR = Path(__file__).resolve().parent

df = pd.read_csv("app/datasheet.csv")

df_cleaned = df.drop(columns = ['FG', '3PT','3P%','FT', 'FT%', 'Result', 'MIN', 'Date', 'FG%', 'STL', 'BLK', 'TO', 'PF'])
int_cols = [ 'REB', 'AST', 'PTS']
for col in int_cols:
   df_cleaned[col] = df_cleaned[col].astype(int)
df_cleaned['Opponent'] = df_cleaned['Opponent'].str.replace(r'^@|^vs', '', regex=True)




def get_stat_probability(df, opponent, category, line, player):
   player_df = df[df['Player'] == player].reset_index(drop=True)
   recent_games = player_df.head(5)
   recent_mean = recent_games[category].mean()
   games = player_df[player_df['Opponent'] == opponent.upper()]
   season_mean = player_df[category].mean()


   if games.empty:
       return {
           "opponent_avg": "N/A",
           "season_avg": float(round(season_mean, 2)),
           "recent_avg": float(round(recent_mean, 2)),
           "prob_over": "N/A",
           "prob_under": "N/A",
           "note": f"{player} has not played against {opponent.upper()} this season — no matchup data available"
       }


   opponent_mean = games[category].mean()
   season_std = player_df[category].std(ddof=1)
   num_games = len(games)
   original_opponent_avg = opponent_mean


   training_data = []
   for i in range(5, len(player_df)):
       window = player_df.iloc[i-5:i]
       game = player_df.iloc[i]


       rec_avg = window[category].mean()
       opp = game['Opponent']
       opp_games = player_df[player_df['Opponent'] == opp]
       opp_avg = opp_games[category].mean() if not opp_games.empty else season_mean


       training_data.append({
           'opponent_avg': opp_avg,
           'season_avg': season_mean,
           'recent_avg': rec_avg,
           'target': game[category]
       })


   train_df = pd.DataFrame(training_data)
   X = train_df[['opponent_avg', 'season_avg', 'recent_avg']]
   y = train_df['target']


   model = LinearRegression().fit(X, y)
   weights = model.coef_


   if num_games < 5:
       weight_opponent = num_games / (num_games + 2)
       weight_season = 1 - weight_opponent
       opponent_avg_adjusted = (original_opponent_avg * weight_opponent) + (season_mean * weight_season)
   else:
       opponent_avg_adjusted = original_opponent_avg




   input_features = pd.DataFrame([{
       'opponent_avg': opponent_avg_adjusted,
       'season_avg': season_mean,
       'recent_avg': recent_mean
   }])


   predicted_mean = model.predict(input_features)[0]
   std_val = season_std 


   if np.isnan(std_val) or std_val == 0:
       single_game_val = games[category].iloc[0]
       prob_over = 100.0 if single_game_val > line else 0.0
       prob_under = 100.0 - prob_over
       note = f"Fallback to direct comparison due to low variation in {num_games} game(s) vs {opponent.upper()}"
   else:
       prob_over = 1 - norm.cdf(line, loc=predicted_mean, scale=std_val)
       prob_under = norm.cdf(line, loc=predicted_mean, scale=std_val)
       note = f"Prediction made using linear regression based on past games."


   return {
       "opponent_avg": float(round(original_opponent_avg, 2)),
       "season_avg": float(round(season_mean, 2)),
       "recent_avg": float(round(recent_mean, 2)),
       "prob_over": float(round(prob_over * 100, 2)),
       "prob_under": float(round(prob_under * 100, 2)),
       "note": note
   }



@app.get("/", response_class=HTMLResponse)
async def root():
    with open(BASE_DIR / "home.html") as f:
        return HTMLResponse(content=f.read())
#-------------------------------------------------------#
@app.get("/stats", response_class=HTMLResponse)
async def get_dashboard():
    with open(BASE_DIR / "main-nba.html") as f:
        return HTMLResponse(content=f.read())
#-------------------------------------------------------#
@app.get("/chart", response_class=HTMLResponse)
async def get_dashboard():
    with open(BASE_DIR / "chart.html") as f:
        return HTMLResponse(content=f.read())
    
@app.post("/input")
async def form_input(req: Request)->dict:
    print("-----------------------inside defore data--------------------")
    data= await req.json()
    team= data.get("opponent")
    typ=data.get("type")
    number = float(data.get("stat_line"))

    player=data.get("player")
   
    result=get_stat_probability(df_cleaned, team, typ, number,player)

    return result

    




if __name__ == "__main__":
      uvicorn.run(app="app.main:app", host="0.0.0.0", port=8000, reload=True)
