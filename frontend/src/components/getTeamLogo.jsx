import defaultLogo from '/logos/default-team-logo.png';

const teamLogoMap = {
  'ARI': 'ARI.png',
  'ATL': 'ATL.png',
  'BAL': 'BAL.png',
  'BUF': 'BUF.png',
  'CAR': 'CAR.png',
  'CHI': 'CHI.png',
  'CIN': 'CIN.png',
  'CLE': 'CLE.png',
  'DAL': 'DAL.png',
  'DEN': 'DEN.png',
  'DET': 'DET.png',
  'GB': 'GB.png',
  'HOU': 'HOU.png',
  'IND': 'IND.png',
  'JAX': 'JAX.png',
  'KC': 'KC.png',
  'LAC': 'LAC.png',
  'LAR': 'LAR.png',
  'LAS': 'LAS.png',
  'MIA': 'MIA.png',
  'MIN': 'MIN.png',
  'NE': 'NE.png',
  'NO': 'NO.png',
  'NYG': 'NYG.png',
  'NYJ': 'NYJ.png',
  'PHI': 'PHI.png',
  'PIT': 'PIT.png',
  'SEA': 'SEA.png',
  'SF': 'SF.png',
  'TB': 'TB.png',
  'TEN': 'TEN.png',
  'WSH': 'WSH.png',
};

const getTeamAbbreviation = (teamName) => {
  const teamNameToAbbreviation = {
    'Arizona': 'ARI',
    'Atlanta': 'ATL',
    'Baltimore': 'BAL',
    'Buffalo': 'BUF',
    'Carolina': 'CAR',
    'Chicago': 'CHI',
    'Cincinnati': 'CIN',
    'Cleveland': 'CLE',
    'Dallas': 'DAL',
    'Denver': 'DEN',
    'Detroit': 'DET',
    'Green Bay': 'GB',
    'Houston': 'HOU',
    'Indianapolis': 'IND',
    'Jacksonville': 'JAX',
    'Kansas City': 'KC',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Las Vegas': 'LAS',
    'Miami': 'MIA',
    'Minnesota': 'MIN',
    'New England': 'NE',
    'New Orleans': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia': 'PHI',
    'Pittsburgh': 'PIT',
    'Seattle': 'SEA',
    'San Francisco': 'SF',
    'Tampa Bay': 'TB',
    'Tennessee': 'TEN',
    'Washington': 'WSH',
  };
  return teamNameToAbbreviation[teamName] || teamName.substring(0, 3).toUpperCase();
};

const getTeamLogo = (game, isAwayTeam) => {
  if (!game) return defaultLogo;

  let teamName;
  let abbreviation;

  if (game.teams_normalized && game.teams_normalized.length === 2) {
    const team = isAwayTeam ? game.teams_normalized[0] : game.teams_normalized[1];
    teamName = team.name;
    abbreviation = team.abbreviation;
  } else {
    teamName = isAwayTeam ? game.away_team : game.home_team;
    abbreviation = getTeamAbbreviation(teamName);
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  return teamLogoMap[abbreviation] 
    ? `${baseUrl}logos/${teamLogoMap[abbreviation]}` 
    : defaultLogo;
};

export default getTeamLogo;