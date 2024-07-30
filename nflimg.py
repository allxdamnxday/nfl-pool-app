import requests
import os

base_url = "https://static.www.nfl.com/t_headshot_desktop_2x/f_auto/league/api/clubs/logos/"

# Create a directory to store the logos
if not os.path.exists("nfl_logos"):
    os.makedirs("nfl_logos")

nfl_teams = ['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS']

for team in nfl_teams:
    url = base_url + team
    response = requests.get(url)
    if response.status_code == 200:
        with open(f"nfl_logos/{team}.png", "wb") as f:
            f.write(response.content)
        print(f"Downloaded logo for {team}")
    else:
        print(f"Failed to download logo for {team}")