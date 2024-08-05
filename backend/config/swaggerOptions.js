// backend/config/swaggerOptions.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'NFL Survivor Pool API',
      version: '1.0.0',
      description: 'API for NFL Survivor Pool Web App',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          User: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
              role: {
                type: 'string',
                enum: ['user', 'admin'],
              },
              activePoolsCount: {
                type: 'number',
              },
              lastLogin: {
                type: 'string',
                format: 'date-time',
              },
              isVerified: {
                type: 'boolean',
              },
              verificationToken: {
                type: 'string',
              },
              resetPasswordToken: {
                type: 'string',
              },
              resetPasswordExpire: {
                type: 'string',
                format: 'date-time',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
            required: ['username', 'email', 'password'],
          },
          Request: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
                description: 'The auto-generated id of the request'
              },
              user: {
                type: 'string',
                description: 'The id of the user who made the request'
              },
              pool: {
                type: 'string',
                description: 'The id of the pool the request is for'
              },
              numberOfEntries: {
                type: 'integer',
                description: 'The number of entries requested'
              },
              status: {
                type: 'string',
                enum: ['pending', 'approved', 'rejected', 'payment_pending'],
                description: 'The current status of the request'
              },
              totalAmount: {
                type: 'number',
                description: 'The total amount to be paid for the entries'
              },
              paymentStatus: {
                type: 'string',
                enum: ['pending', 'confirmed', 'failed'],
                description: 'The status of the payment for this request'
              },
              transactionId: {
                type: 'string',
                description: 'The transaction id of the payment'
              },
              paymentType: {
                type: 'string',
                description: 'The type of payment used'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'The date and time when the request was created'
              }
            }
          },
          Entry: {
            type: 'object',
            properties: {
              _id: {
                type: 'string'
              },
              user: {
                type: 'string'
              },
              pool: {
                type: 'string'
              },
              request: {
                type: 'string'
              },
              entryNumber: {
                type: 'integer'
              },
              status: {
                type: 'string',
                enum: ['active', 'eliminated']
              },
              eliminatedWeek: {
                type: 'integer'
              },
              createdAt: {
                type: 'string',
                format: 'date-time'
              }
            }
          },
          EntryWithPicks: {
            type: 'object',
            properties: {
              _id: {
                type: 'string'
              },
              user: {
                type: 'string'
              },
              pool: {
                type: 'string'
              },
              request: {
                type: 'string'
              },
              entryNumber: {
                type: 'integer'
              },
              status: {
                type: 'string',
                enum: ['active', 'eliminated']
              },
              eliminatedWeek: {
                type: 'integer'
              },
              createdAt: {
                type: 'string',
                format: 'date-time'
              },
              picks: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Pick'
                }
              }
            }
          },
          Pick: {
            type: 'object',
            properties: {
              _id: {
                type: 'string'
              },
              entry: {
                type: 'string'
              },
              entryNumber: {
                type: 'integer'
              },
              team: {
                type: 'string'
              },
              week: {
                type: 'integer'
              },
              game: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string'
                  },
                  away_team: {
                    type: 'string'
                  },
                  home_team: {
                    type: 'string'
                  },
                  event_date: {
                    type: 'string',
                    format: 'date-time'
                  },
                  schedule: {
                    type: 'object',
                    properties: {
                      week: {
                        type: 'integer'
                      }
                    }
                  }
                }
              }
            }
          },
          PickInput: {
            type: 'object',
            required: ['team'],
            properties: {
              team: {
                type: 'string',
                description: 'The team to pick'
              }
            }
          },
          Pool: {
            type: 'object',
            properties: {
              _id: {
                type: 'string'
              },
              name: {
                type: 'string'
              },
              season: {
                type: 'integer'
              },
              currentWeek: {
                type: 'integer'
              },
              status: {
                type: 'string',
                enum: ['pending', 'active', 'completed', 'open']
              },
              maxParticipants: {
                type: 'integer'
              },
              entryFee: {
                type: 'number'
              },
              prizeAmount: {
                type: 'number'
              },
              creator: {
                type: 'string'
              },
              participants: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              eliminatedUsers: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              description: {
                type: 'string'
              },
              startDate: {
                type: 'string',
                format: 'date-time'
              },
              endDate: {
                type: 'string',
                format: 'date-time'
              },
              maxEntries: {
                type: 'integer'
              },
              prizePot: {
                type: 'number'
              }
            }
          },
          PoolInput: {
            type: 'object',
            required: ['name', 'season', 'maxParticipants', 'entryFee', 'prizeAmount', 'description', 'startDate', 'endDate', 'maxEntries', 'prizePot'],
            properties: {
              name: {
                type: 'string'
              },
              season: {
                type: 'integer'
              },
              maxParticipants: {
                type: 'integer'
              },
              entryFee: {
                type: 'number'
              },
              prizeAmount: {
                type: 'number'
              },
              description: {
                type: 'string'
              },
              startDate: {
                type: 'string',
                format: 'date-time'
              },
              endDate: {
                type: 'string',
                format: 'date-time'
              },
              maxEntries: {
                type: 'integer'
              },
              prizePot: {
                type: 'number'
              }
            }
          },
          PoolWithUserInfo: {
            type: 'object',
            allOf: [
              {
                $ref: '#/components/schemas/Pool'
              },
              {
                type: 'object',
                properties: {
                  userRequests: {
                    type: 'integer'
                  },
                  userEntries: {
                    type: 'integer'
                  },
                  canJoin: {
                    type: 'boolean'
                  }
                }
              }
            ]
          },
          PoolWithEntries: {
            type: 'object',
            allOf: [
              {
                $ref: '#/components/schemas/Pool'
              },
              {
                type: 'object',
                properties: {
                  activeEntries: {
                    type: 'integer'
                  },
                  userEntryId: {
                    type: 'string'
                  }
                }
              }
            ]
          },
          PoolStats: {
            type: 'object',
            properties: {
              totalParticipants: {
                type: 'integer'
              },
              eliminatedParticipants: {
                type: 'integer'
              },
              currentWeek: {
                type: 'integer'
              }
            }
          }
        },
      },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;