# sftp-middleware-node

Middleware em Node.js que realiza upload, listagem e download de arquivos em um servidor SFTP.

## 📋 Descrição

Este projeto é uma API REST desenvolvida com Express.js que permite realizar operações de upload, listagem e download de arquivos em servidores SFTP. As credenciais ficam armazenadas localmente em um arquivo JSON (ignorado pelo Git) e cada requisição só precisa enviar no header um UUID (`sftp-id`) que referencia a credencial.

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

## 🔑 Configuração das credenciais

1. Crie um arquivo `sftp-credentials.json` na raiz do projeto (já está no `.gitignore`).  
2. Adicione as credenciais usando um UUID como chave:

```json
{
  "b21f5c56-7f4b-4c7a-8e73-7ebf9f7c0b1d": {
    "host": "sftp.exemplo.com",
    "port": 22,
    "username": "usuario",
    "password": "senha"
  }
}
```

- Use o valor do UUID no header `sftp-id` em cada requisição.  
- Porta é opcional (padrão 22).  
- Para armazenar o arquivo em outro caminho, defina `SFTP_CREDENTIALS_FILE` apontando para o JSON.

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
- `sftp-id`: UUID que referencia as credenciais salvas no servidor

**Query Parameters:**
- `remotePath` (opcional): Caminho remoto onde o arquivo será salvo (padrão: /)

**Body:**
- `file`: Arquivo a ser enviado (multipart/form-data)

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/sftp/upload \
  -H "sftp-id: b21f5c56-7f4b-4c7a-8e73-7ebf9f7c0b1d" \
  -F "file=@/caminho/para/arquivo.txt" \
  -F "remotePath=/pasta/destino"
```

### Listagem de Arquivos
```
GET /api/sftp/list
```

**Headers obrigatórios:**
- `sftp-id`: UUID que referencia as credenciais salvas no servidor

**Query Parameters:**
- `remotePath` (opcional): Caminho remoto a ser listado (padrão: /)

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/sftp/list?remotePath=/pasta" \
  -H "sftp-id: b21f5c56-7f4b-4c7a-8e73-7ebf9f7c0b1d"
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
- `sftp-id`: UUID que referencia as credenciais salvas no servidor

**Query Parameters:**
- `remoteFilePath` (obrigatório): Caminho completo do arquivo remoto

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/sftp/download?remoteFilePath=/pasta/arquivo.txt" \
  -H "sftp-id: b21f5c56-7f4b-4c7a-8e73-7ebf9f7c0b1d" \
  -o arquivo_baixado.txt
```

## 🔒 Segurança

- As credenciais ficam em um arquivo local (`sftp-credentials.json`) fora do controle de versão
- O cliente só envia o UUID da credencial (`sftp-id`) nos headers
- Os arquivos temporários são automaticamente removidos após upload/download

## 🛠️ Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)
- `SFTP_CREDENTIALS_FILE`: Caminho para o JSON de credenciais (padrão: ./sftp-credentials.json)

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
