// перевірка чи сервер пише в чатах
// alert('ok')
// зєднання

let socket = io();
// севрер пише в консолі до учасника
// socket.on('welcome', (data) => {
//    console.log(data);
// });


// сама кнопка
// дівка де будуть повідомлення
let messageBtn = document.getElementById('message-btn');
let messagesDiv = document.getElementById('messages');


socket.on('message', function (message) {
    // console.log(message);
    showMessage(message);
});


//цикл по повідомленях щоб показували в історії які написали до тебе
socket.on('init', function ({messages}) {
    for (const message of messages){
    showMessage(message);
    }
});



// при кліці на кнопку забираю дані і відправляю на сервак

messageBtn.onclick = function () {
  let messageInput = document.getElementById('message-input');
  let messageValue = messageInput.value;
  messageInput.value = '';
 socket.emit('message', {message: messageValue});
};

//відображення з консольки повідомлення
function showMessage(message) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add('message');
    messageDiv.innerText = `${message.date} ${message.author}: ${message.text}`;
    messagesDiv.appendChild(messageDiv);
}
