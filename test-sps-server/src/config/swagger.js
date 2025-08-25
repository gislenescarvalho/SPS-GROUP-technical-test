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
              type: 'string',
              description: 'ID único do log de auditoria'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora do evento'
            },
            userId: {
              type: 'integer',
              description: 'ID do usuário que executou a ação'
            },
            userEmail: {
              type: 'string',
              description: 'Email do usuário'
            },
            userType: {
              type: 'string',
              description: 'Tipo do usuário'
            },
            action: {
              type: 'string',
              description: 'Tipo de ação executada'
            },
            resource: {
              type: 'string',
              description: 'Recurso afetado'
            },
            resourceId: {
              type: 'string',
              description: 'ID do recurso afetado'
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Nível de severidade do evento'
            },
            success: {
              type: 'boolean',
              description: 'Se a ação foi bem-sucedida'
            },
            ipAddress: {
              type: 'string',
              description: 'Endereço IP do usuário'
            },
            userAgent: {
              type: 'string',
              description: 'User agent do navegador'
            }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'type', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
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
            password: {
              type: 'string',
              minLength: 8,
              description: 'Senha do usuário'
            }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
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
            password: {
              type: 'string',
              minLength: 8,
              description: 'Nova senha do usuário'
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
      './src/validations/*.js',
      './src/middleware/*.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
