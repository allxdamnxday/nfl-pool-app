import os

# Dictionary mapping abbreviations to full team names
team_names = {
    'ARI': 'Arizona',
    'ATL': 'Atlanta',
    'BAL': 'Baltimore',
    'BUF': 'Buffalo',
    'CAR': 'Carolina',
    'CHI': 'Chicago',
    'CIN': 'Cincinnati',
    'CLE': 'Cleveland',
    'DAL': 'Dallas',
    'DEN': 'Denver',
    'DET': 'Detroit',
    'GB': 'Green Bay',
    'HOU': 'Houston',
    'IND': 'Indianapolis',
    'JAX': 'Jacksonville',
    'KC': 'Kansas City',
    'LAC': 'Los Angeles',
    'LAR': 'Los Angeles',
    'LV': 'Las Vegas',
    'MIA': 'Miami',
    'MIN': 'Minnesota',
    'NE': 'New England',
    'NO': 'New Orleans',
    'NYG': 'New York',
    'NYJ': 'New York',
    'PHI': 'Philadelphia',
    'PIT': 'Pittsburgh',
    'SEA': 'Seattle',
    'SF': 'San Francisco',
    'TB': 'Tampa Bay',
    'TEN': 'Tennessee',
    'WAS': 'Washington'
}

# Directory where your logo files are stored
directory = 'E:\\CODE\\NFLPOOL\\nfl-atlas\\nfl-pool-app\\frontend\\public\\img\\nfl_logos'

# Iterate through files in the directory
for filename in os.listdir(directory):
    if filename.endswith('.png'):  # Assuming logos are in PNG format
        abbr = filename.split('.')[0]  # Get the abbreviation without file extension
        if abbr in team_names:
            new_name = f"{team_names[abbr]}.png"
            old_file = os.path.join(directory, filename)
            new_file = os.path.join(directory, new_name)
            os.rename(old_file, new_file)
            print(f"Renamed {filename} to {new_name}")
        else:
            print(f"No matching team name found for {filename}")

print("Renaming complete!")