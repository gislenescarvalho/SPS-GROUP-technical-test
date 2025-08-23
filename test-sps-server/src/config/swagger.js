const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SPS Group API',
      version: '2.0.0',
      description: 'API completa para gerenciamento de usuários com funcionalidades avançadas',
      contact: {
        name: 'SPS Group',
        email: 'contato@spsgroup.com.br'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de Desenvolvimento - V1'
      },
      {
        url: 'http://localhost:3000/api/v2',
        description: 'Servidor de Desenvolvimento - V2'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do endpoint de login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do usuário'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            type: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'Tipo do usuário'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário'
            },
            password: {
              type: 'string',
              description: 'Senha do usuário'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                accessToken: {
                  type: 'string',
                  description: 'Token de acesso JWT'
                },
                refreshToken: {
                  type: 'string',
                  description: 'Token de renovação (V2 apenas)'
                },
                expiresIn: {
                  type: 'integer',
                  description: 'Tempo de expiração em segundos'
                }
              }
            }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'Token de renovação'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer'
                },
                limit: {
                  type: 'integer'
                },
                total: {
                  type: 'integer'
                },
                totalPages: {
                  type: 'integer'
                }
              }
            },
            links: {
              type: 'object',
              properties: {
                first: {
                  type: 'string'
                },
                last: {
                  type: 'string'
                },
                next: {
                  type: 'string'
                },
                prev: {
                  type: 'string'
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            userId: {
              type: 'integer'
            },
            userEmail: {
              type: 'string'
            },
            action: {
              type: 'string'
            },
            resource: {
              type: 'string'
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical']
            },
            success: {
              type: 'boolean'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticação',
        description: 'Endpoints para autenticação e gerenciamento de tokens'
      },
      {
        name: 'Usuários',
        description: 'Gerenciamento de usuários (CRUD)'
      },
      {
        name: 'Métricas',
        description: 'Monitoramento e métricas da aplicação'
      },
      {
        name: 'Auditoria',
        description: 'Logs de auditoria e rastreamento de ações (V2)'
      },
      {
        name: 'Versionamento',
        description: 'Informações sobre versões da API'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/validations/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
