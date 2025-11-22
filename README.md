# sftp-middleware-node

Middleware em Node.js que realiza upload, listagem e download de arquivos em um servidor SFTP.

## 📋 Descrição

Este projeto é uma API REST desenvolvida com Express.js que permite realizar operações de upload, listagem e download de arquivos em servidores SFTP. Cada requisição exige credenciais SFTP nos headers para autenticação.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Multer** - Middleware para upload de arquivos
- **ssh2-sftp-client** - Cliente SFTP para Node.js

## 📁 Estrutura do Projeto

```
sftp-middleware-node/
├── src/
│   ├── config/
│   │   └── sftp.js           # Configuração do cliente SFTP
│   ├── controllers/
│   │   └── sftpController.js # Controladores das operações SFTP
│   ├── middlewares/
│   │   └── sftpAuth.js       # Middleware de validação de credenciais
│   ├── routes/
│   │   └── sftpRoutes.js     # Definição das rotas
│   └── server.js             # Servidor Express principal
├── uploads/                  # Arquivos temporários de upload
├── downloaded/               # Arquivos temporários de download
├── package.json
└── README.md
```

## 🔧 Instalação

```bash
# Clone o repositório
git clone https://github.com/joaoeymard/sftp-middleware-node.git

# Entre no diretório
cd sftp-middleware-node

# Instale as dependências
npm install
```

## ▶️ Executando o Projeto

```bash
# Inicia o servidor
npm start

# O servidor estará rodando em http://localhost:3000
```

## 📡 Endpoints

### Health Check
```
GET /health
```
Verifica se o servidor está funcionando.

**Resposta:**
```json
{
  "status": "ok",
  "message": "SFTP Middleware Node.js is running"
}
```

### Root
```
GET /
```
Retorna informações sobre a API e seus endpoints.

### Upload de Arquivo
```
POST /api/sftp/upload
```

**Headers obrigatórios:**
- `sftp-host`: Hostname do servidor SFTP
- `sftp-username`: Usuário SFTP
- `sftp-password`: Senha SFTP
- `sftp-port` (opcional): Porta do servidor SFTP (padrão: 22)

**Query Parameters:**
- `remotePath` (opcional): Caminho remoto onde o arquivo será salvo (padrão: /)

**Body:**
- `file`: Arquivo a ser enviado (multipart/form-data)

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/sftp/upload \
  -H "sftp-host: sftp.exemplo.com" \
  -H "sftp-username: usuario" \
  -H "sftp-password: senha" \
  -F "file=@/caminho/para/arquivo.txt" \
  -F "remotePath=/pasta/destino"
```

### Listagem de Arquivos
```
GET /api/sftp/list
```

**Headers obrigatórios:**
- `sftp-host`: Hostname do servidor SFTP
- `sftp-username`: Usuário SFTP
- `sftp-password`: Senha SFTP
- `sftp-port` (opcional): Porta do servidor SFTP (padrão: 22)

**Query Parameters:**
- `remotePath` (opcional): Caminho remoto a ser listado (padrão: /)

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/sftp/list?remotePath=/pasta" \
  -H "sftp-host: sftp.exemplo.com" \
  -H "sftp-username: usuario" \
  -H "sftp-password: senha"
```

**Resposta:**
```json
{
  "path": "/pasta",
  "files": [
    {
      "name": "arquivo.txt",
      "type": "-",
      "size": 1024,
      "modifyTime": 1638360000000,
      "accessTime": 1638360000000,
      "rights": {
        "user": "rw",
        "group": "r",
        "other": "r"
      }
    }
  ]
}
```

### Download de Arquivo
```
GET /api/sftp/download
```

**Headers obrigatórios:**
- `sftp-host`: Hostname do servidor SFTP
- `sftp-username`: Usuário SFTP
- `sftp-password`: Senha SFTP
- `sftp-port` (opcional): Porta do servidor SFTP (padrão: 22)

**Query Parameters:**
- `remoteFilePath` (obrigatório): Caminho completo do arquivo remoto

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/sftp/download?remoteFilePath=/pasta/arquivo.txt" \
  -H "sftp-host: sftp.exemplo.com" \
  -H "sftp-username: usuario" \
  -H "sftp-password: senha" \
  -o arquivo_baixado.txt
```

## 🔒 Segurança

- As credenciais SFTP são enviadas via headers em cada requisição
- Os arquivos temporários são automaticamente removidos após upload/download
- Não armazena credenciais no servidor

## 🛠️ Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)

## 📝 Notas

- Os diretórios `uploads/` e `downloaded/` são usados temporariamente e seus conteúdos são limpos automaticamente
- Certifique-se de que o servidor SFTP está acessível e as credenciais são válidas
- A porta padrão do SFTP é 22, mas pode ser customizada via header `sftp-port`

## ⚠️ Considerações para Produção

Para uso em produção, considere implementar:
- **Rate limiting**: Limitação de taxa para prevenir abuso dos endpoints
- **Autenticação**: Sistema de autenticação adicional para a API REST
- **HTTPS**: Certificados SSL/TLS para comunicação segura
- **Logs**: Sistema de logging mais robusto para auditoria
- **Validação**: Validação adicional de tipos e tamanhos de arquivos

## 📄 Licença

ISC
