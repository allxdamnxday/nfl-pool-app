require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');  // Regular fs module
const fsPromises = require('fs').promises;  // Promises version of fs
const csvWriter = require('csv-write-stream');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

async function run() {
  let client;
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = client.db('test'); // Replace 'test' with your actual database name
    const writer = csvWriter();
    writer.pipe(fs.createWriteStream('output.csv'));

    console.log('Starting aggregation');

    const results = await db.collection('entries').aggregate([
      // Join with the Users collection to get user information
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      
      // Join with the Picks collection to get all picks for the entry
      {
        $lookup: {
          from: 'picks',
          let: { entryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$entry', '$$entryId']
                }
              }
            }
          ],
          as: 'pick'
        }
      },
      // Unwind the 'pick' array to process each pick separately
      { $unwind: { path: '$pick', preserveNullAndEmptyArrays: true } },
      
      // Join with the Games collection to get accurate team information
      {
        $lookup: {
          from: 'games',
          localField: 'pick.game',
          foreignField: '_id',
          as: 'game'
        }
      },
      { $unwind: { path: '$game', preserveNullAndEmptyArrays: true } },
      
      // Extract the picked team mascot from the game
      {
        $addFields: {
          pickedTeamMascot: {
            $let: {
              vars: {
                pickedTeamName: '$pick.team',
                teams: '$game.teams_normalized'
              },
              in: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$$teams',
                      as: 'team',
                      cond: {
                        $eq: ['$$team.name', '$$pickedTeamName']
                      }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      },
      
      // Handle cases where the team name might not match directly
      {
        $addFields: {
          pickedTeamMascot: {
            $ifNull: ['$pickedTeamMascot.mascot', '$pick.team']
          }
        }
      },
      
      // Project the necessary fields
      {
        $project: {
          _id: 0,
          username: '$user.username',
          entryNumber: 1,
          status: 1,
          eliminatedWeek: 1,
          week: '$pick.week', // Include the week number
          pickedTeam: '$pickedTeamMascot',
          pickResult: '$pick.result',
          isWin: '$pick.isWin'
        }
      }
    ], { maxTimeMS: 60000 }).toArray();

    console.log('Aggregation completed, number of results:', results.length);

    // Write to CSV
    results.forEach(result => {
      writer.write(result);
    });

    writer.end();
    console.log('CSV file written');

    // Write to JSON
    const weekPicks = results.reduce((acc, result) => {
      const week = result.week || 'unknown';
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(result);
      return acc;
    }, {});

    await fsPromises.writeFile('weekPicks.json', JSON.stringify(weekPicks, null, 2));
    console.log('JSON file written');

  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

run().catch(console.error);
