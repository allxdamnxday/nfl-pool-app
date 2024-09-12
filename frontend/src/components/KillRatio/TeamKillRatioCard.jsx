import React from 'react';
import { FaFootballBall, FaSkull, FaBalanceScale } from 'react-icons/fa';

const TeamKillRatioCard = ({ team }) => {
  if (!team) return null;

  const { teamName, teamFullName, picks, eliminations, killRatio } = team;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 transition duration-300 ease-in-out hover:shadow-xl hover:scale-102">
      <div className="bg-gradient-to-r from-nfl-blue to-nfl-purple p-4">
        <h3 className="text-xl font-bold text-nfl-white truncate">
          {teamFullName || teamName || 'Unknown Team'}
        </h3>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <InfoItem icon={FaFootballBall} label="Picks" value={picks || 0} />
          <InfoItem icon={FaSkull} label="Eliminations" value={eliminations || 0} />
        </div>
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FaBalanceScale className="text-2xl text-nfl-light-blue mr-2" />
            <span className="text-lg font-medium text-gray-600">Kill Ratio</span>
          </div>
          <span className="text-3xl font-bold text-nfl-blue">{(killRatio || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex flex-col items-center">
      <Icon className="text-2xl mb-1 text-nfl-light-blue" />
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-xl font-bold text-nfl-blue">{value}</span>
    </div>
  );
};

export default TeamKillRatioCard;