const teamLogoMap = require('./teamLogoMap');

const getLogoUrl = (teamAbbreviation) => {
  const logoFilename = teamLogoMap[teamAbbreviation];
  return logoFilename ? `/logos/${logoFilename}` : null;
};

module.exports = { getLogoUrl };