// npm i express express-session mongoose pug socket.io
//підключення
//хреновий варінат треба було через плагін щоб показувало перші 10 ,  якщо буде декілька тисяч повідомлень
let http = require('http');
let express = require('express');
let mongoose = require('mongoose');
let session = require('express-session');
let path = require('path');


//підключення модельок
let Chat = require('./models/Chat');
let Message = require('./models/Message');


//підеднання до бази
mongoose.connect('mongodb://localhost:27017/chatf', {useNewUrlParser: true});

// створення експрес
let app = express();
// настройка пишу що буду юзати вюшки
app.set('views', path.join(__dirname, 'views'));
// вказую що буду використовувати шаблінонізатор
app.set('view engine', 'pug');
// підключення папки статичної
app.use(express.static(path.join(__dirname, 'public')));


// настройка парсерів
app.use(express.urlencoded({extended: true}));
app.use(express.json());


//підключення сесії іншим способом через проміжний обробник якщо його використовувати не раз то так
// якщож один раз то ліпше все в рядок записати

let sessionMiddleware = session(({
    secret: 'asafdf4faddsf4',
    resave: false,
    saveUninitialized: false
}));

app.use(sessionMiddleware);


//створення сервера на основі експресу но не експрес


let server = http.createServer(app);

// підключення сокітів - вони працюють через івенти
// можна не вказувати серверт тоді він сам створить стандартний
// let io = require('socket.io')(); або let io = require('socket.io');
// вказую свій сервак
let io = require('socket.io')(server);

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});


io.on('connect', async function (socket) {
    console.log('connected', socket.id);
    //діставання повідомлення з сесії
    let principal =
        socket.request.session.principal
            ? socket.request.session.principal
            : {name: 'Anonim'};
    let chat =
        //якщо в мене чат існує я його добавлю в іншому випадку дефолтний чат
        socket.request.session.chat
            ? socket.request.session.chat
            : {_id: '5c796802c6e6bd211cb1ea17'};


    //сортування сокетів по кімнаті
    socket.join(chat._id);

    //надсилання всім повідомлення
    io.to(socket.id).emit('init', {
       messages: await Message.find({chat: chat._id})
    });


    //привітання коли заходить в чат
    io.to(socket.id).emit('message', {
       text: 'Welcome!',
       author: 'Admin',
       date: new Date()
    });

    //тепер повідомляем що хтось зайшов чат

    socket.broadcast.to(chat._id).emit('message',{
        text: `${principal.name} connected!`,
        author: 'Admin',
        date: new Date()
    });



    // сервер пише до конретного учасникав консолі
    // io.to(socket.id).emit('welcome', {message: 'Hello !'});

    //приймання повідомлення
    socket.on('message', async function (data) {
        // console.log(data);
        let message = data.message;
        let date = new Date();
        let newMessage = await Message.create({
            author: principal.name,
            chat,
            text: message,
            date
        });
        // відсилання всім повідомлення в всіх чатах
        // io.emit('message', newMessage);
        //тільки окремій
        io.to(chat._id).emit('message', newMessage);
    });


    socket.on('disconnect', () => {
        console.log('disconnected', socket.id);
        socket.broadcast.to(chat._id).emit('message',{
            text: `${principal.name} disconnected!`,
            author: 'Admin',
            date: new Date()
        });
    });
});


//перевірка
// app.get('/',(req, res, next) => {
//     res.end('Chat');
// });

//обробники
app.get('/', (req, res, next) => {
    res.render('index');
});

// сесія і поле стало обовязкове де саме не памятаю
app.get('/chats', async (req, res, next) => {
    let chats = await Chat.find();
    res.render(
        'chats',
        {
            principal: req.session.principal,
            chats
        }
    );
});

// app.get('/conversation',(req, res, next) => {
//     res.render('chat');
// });

//запись створеного чату вроді но чату точно в сесію
app.get('/conversations/:id', async (req, res, next) => {
    req.session.chat = await Chat.findById(req.params.id);
    res.render('chat');
});


//добавляння логіна через сесію саме надійнеше через паспорт
app.post('/login', (req, res, next) => {
    req.session.principal = req.body;
    // перенаправлення на наступну сторінку чата
    res.redirect('/chats')
});

//створення чату
app.post('/create-chat', async (req, res, next) => {
    await Chat.create(req.body);
    res.redirect('/chats');
});

server.listen(3000, () => {
    console.log('Listenins...');
});