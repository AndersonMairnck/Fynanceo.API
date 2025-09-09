# Fynanceo.API
 Documentação Completa - Fynanceo ERP API
📖 Índice
Visão Geral

Tecnologias

Estrutura do Projeto

Configuração do Ambiente

Endpoints da API

Autenticação JWT

Exemplos de Uso

Migrações e Banco de Dados

Solução de Problemas

Deploy

🎯 Visão Geral
O Fynanceo ERP é um sistema completo para gestão de pequenos e médios comércios (padarias, lanchonetes, pizzarias, etc.) com arquitetura moderna API RESTful + Frontend desacoplado.

Funcionalidades Principais:

✅ Autenticação e autorização com JWT

✅ Gestão de produtos e categorias

✅ Controle de estoque automático

✅ PDV (Frente de Caixa) completo

✅ Gestão de pedidos e vendas

✅ Controle de entregas

✅ Relatórios e analytics

🛠 Tecnologias
Backend
.NET 9.0 - Framework principal

Entity Framework Core - ORM para PostgreSQL

PostgreSQL - Banco de dados relacional

JWT - Autenticação por tokens

Swagger/OpenAPI - Documentação interativa

Docker - Containerização

Frontend (Próxima Fase)
React.js ou Vue.js

Material-UI ou Bootstrap

Axios para consumo de API

📁 Estrutura do Projeto
text
Fynanceo/
├── Fynanceo.API/                 # Backend API
│   ├── Controllers/              # Controladores da API
│   ├── Models/                   # Modelos de dados
│   │   ├── Entities/             # Entidades do banco
│   │   └── DTOs/                 # Objetos de transferência
│   ├── Data/                     # Contexto do banco
│   ├── Services/                 # Lógica de negócio
│   └── Properties/               # Configurações
├── Fynanceo.Web/                 # Frontend (futuro)
└── Documentation/                # Documentação
⚙️ Configuração do Ambiente
Pré-requisitos
.NET 9.0 SDK

PostgreSQL

Git

1. Clone o repositório
bash
git clone https://github.com/seu-usuario/Fynanceo.git
cd Fynanceo
2. Configure o banco de dados
appsettings.json:

json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=FynanceoDB;Username=postgres;Password=sua_senha;"
  },
  "AppSettings": {
    "Token": "chave-super-secreta-minimo-32-caracteres-aqui"
  }
}
3. Instale as dependências
bash
cd Fynanceo.API
dotnet restore
4. Execute as migrações
bash
dotnet ef database update
5. Execute a aplicação
bash
dotnet run
Acesse: https://localhost:7000/swagger

🔌 Endpoints da API
Autenticação
Método	Endpoint	Descrição
POST	/api/Auth/login	Login de usuário
POST	/api/Auth/register	Registrar novo usuário
Produtos
Método	Endpoint	Descrição
GET	/api/Products	Listar produtos ativos
GET	/api/Products/{id}	Buscar produto por ID
POST	/api/Products	Criar novo produto
PUT	/api/Products/{id}	Atualizar produto
PATCH	/api/Products/deactivate/{id}	Desativar produto
PATCH	/api/Products/activate/{id}	Reativar produto
Pedidos
Método	Endpoint	Descrição
GET	/api/Orders	Listar pedidos
GET	/api/Orders/{id}	Buscar pedido por ID
POST	/api/Orders	Criar novo pedido
PATCH	/api/Orders/{id}/status	Atualizar status do pedido
DELETE	/api/Orders/{id}	Cancelar pedido
Entregas
Método	Endpoint	Descrição
GET	/api/Deliveries	Listar entregas
GET	/api/Deliveries/{id}	Buscar entrega por ID
PATCH	/api/Deliveries/{id}/status	Atualizar status da entrega
GET	/api/Deliveries/stats	Estatísticas de entregas
🔐 Autenticação JWT
Login
bash
curl -X POST "https://localhost:7000/api/Auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fynanceo.com","password":"admin123"}'
Response
json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@fynanceo.com",
    "role": "Administrador"
  }
}
Uso do Token
bash
curl -X GET "https://localhost:7000/api/Products" \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
🚀 Exemplos de Uso
1. Criar Pedido com Entrega
bash
curl -X POST "https://localhost:7000/api/Orders" \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "paymentMethod": "Pix",
    "isDelivery": true,
    "items": [
      {"productId": 1, "quantity": 2, "unitPrice": 0.50},
      {"productId": 2, "quantity": 1, "unitPrice": 3.50}
    ],
    "deliveryInfo": {
      "deliveryPerson": "Entregador 1",
      "deliveryAddress": "Rua Teste, 123",
      "customerPhone": "(11) 99999-9999",
      "estimatedDeliveryTime": "2024-01-01T18:00:00"
    }
  }'
2. Atualizar Status de Entrega
bash
curl -X PATCH "https://localhost:7000/api/Deliveries/1/status" \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "EmRota"}'
🗄️ Migrações e Banco de Dados
Comandos Úteis
bash
# Criar nova migração
dotnet ef migrations add NomeDaMigracao

# Aplicar migrações
dotnet ef database update

# Reverter migração
dotnet ef database update NomeDaMigracaoAnterior

# Recriar banco completo
dotnet ef database drop --force
dotnet ef database update
Estrutura do Banco
sql
-- Tabelas principais
- users
- products
- categories
- customers
- orders
- order_items
- deliveries
🐛 Solução de Problemas
Erro Comum: Token Inválido
Sintoma: 401 Unauthorized
Solução: Verifique se o token está com Bearer na frente

Erro Comum: PostgreSQL não conecta
Sintoma: Npgsql.NpgsqlException
Solução: Verifique se o PostgreSQL está rodando e a connection string

Erro Comum: Migração falha
Sintoma: Method 'get_LockReleaseBehavior' in type 'NpgsqlHistoryRepository'
Solução: Use versões compatíveis dos pacotes:

bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 8.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 8.0.0
Comandos de Debug
bash
# Verificar se API está respondendo
curl -X GET "https://localhost:7000/api/AuthTest/verify-token" \
  -H "Authorization: Bearer TOKEN"

# Verificar banco de dados
curl -X GET "https://localhost:7000/api/Debug/check-db"
🚀 Deploy
Docker Compose
yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
      - "7000:7000"
    environment:
      - ConnectionStrings__DefaultConnection=Host=db;Database=FynanceoDB;Username=postgres;Password=password;
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=FynanceoDB
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
Dockerfile
dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Fynanceo.API.dll"]
Variáveis de Ambiente de Produção
bash
export ConnectionStrings__DefaultConnection="Host=prod-db;Database=FynanceoDB;Username=user;Password=pass;"
export AppSettings__Token="chave-super-secreta-producao-aqui"
export ASPNETCORE_ENVIRONMENT="Production"
📞 Suporte
Credenciais de Teste
Admin:

Email: admin@fynanceo.com

Senha: admin123

Funcionário:

Email: funcionario@fynanceo.com

Senha: func123

Logs e Monitoramento
bash
# Ver logs da aplicação
dotnet run --verbose

# Logs detalhados no Program.cs
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);
📄 Licença
Este projeto está sob licença MIT. Veja o arquivo LICENSE para detalhes.

🤝 Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

✨ Desenvolvido com 💜 para pequenos e médios comércios

*Documentação atualizada em: 09/09/2024*