FROM docker.io/library/nginx:latest

WORKDIR /usr/share/nginx/html 

#Копируем все файлы в папку nginx/html для того что бы наш веб сервер мог с ними взаимодействовать, так как внутри конфига записана данная папка для просмотра и поиска файлов
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html 



