import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Receiptify API',
      version: '1.0.0',
      description: 'AI 기반 영수증 스캔 가계부 API',
      contact: {
        name: 'API Support',
        email: 'support@receiptify.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      },
      {
        url: 'https://api.receiptify.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/swagger/*.yaml'] // 경로 설정
};

export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin-bottom: 20px }
    .swagger-ui .scheme-container { display: none }
  `,
  customSiteTitle: 'Receiptify API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
};

export const swaggerSpec = swaggerJsdoc(options);