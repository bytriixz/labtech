import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';


//configuração do express   
const app = express();
const PORT = process.env.PORT || 3000;

//converte informações json em onjetos javascript
app.use(express.json()); 

//permite acessar os arquivos da pasta static
app.use(express.static('static'));


//Definindo a página de login como página inicial
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

//Configuração do banco de dados
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "usuarios.db",
});

//definindo modelo de usuário para o banco de dados
const Usuario = sequelize.define("Usuario", {
  fullname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

//mantém a tabela atualizada
await sequelize.sync();


//Função de cadastro do usuário
app.post("/cadastrarUser", async (req, res) =>{

    //receber dados enviados pelo formulário e criar as variáveis correspondentes
    const {fullname, email, username, password } = req.body;

    try {
        //criptografar senha e registrar usuário no banco de dados
        const senhaCriptografada = await bcrypt.hash(password,10);
        const novoUsuario = await Usuario.create({
            fullname,
            email,
            username,
            password: senhaCriptografada,
        });

        //envia o resultado da ação para o frontend
        res.status(201).json({ message: "Conta criada com sucesso!"});
    
    }catch(error){
        //verificar se já existe o usuário ou email digitado
        if(error.name ==="SequelizeUniqueConstrainError"){
            //em caso afirmativo, enviar s mensagem de erro para o frontend
            return res.status(400).json({error: "Usuário ou email já cadastrado."});
        }

        //caso ocorra outro erro
        console.error("Erro ao cadastrar", error);
        res.status(500).json({ error: "Erro interno ao cadastrar usuário."});
    }
});

//inicializa o servidor
app.listen(PORT, () => {
console.log(`Servidor rodando em http://localhost:${PORT}`);
});