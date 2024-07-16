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
