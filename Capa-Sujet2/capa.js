
// **********************************************************************************************************************
//                                               Script qui gère le côté serveur
//                                               HEAU Vincent- Sujet 2 - CAPA
// **********************************************************************************************************************
/* Il s'exécute dans la console via la requête 'node capa.js' et permet le fonctionnement des websockets. Son lancement crée un serveur
localhost et les communications entre websockets se font entre les fichiers jeu_architecture.js et ce fichier capa.js */

// Initialisation des constantes node JS utiles
const http = require('http');
const fs = require('fs');
const path = require('path');

// Création du Serveur (cette partie est cruciale pour pouvoir notamment séparer le code)
var serveur = http.createServer(function (request, response) {
    const url = request.url.split('?');
    fs.readFile('./' + url[0], function(err, data) {
        if (!err) {
            var dotoffset = url[0].lastIndexOf('.');
            var mimetype = dotoffset == -1
                            ? 'text/html'
                            : {
                                '.html' : 'text/html',
                                '.ico' : 'image/x-icon',
                                '.jpg' : 'image/jpeg',
                                '.png' : 'image/png',
                                '.gif' : 'image/gif',
                                '.css' : 'text/css',
                                '.js' : 'text/javascript',
                                '.TTF': 'font/ttf'
                              }[ url[0].substr(dotoffset) ];
            response.setHeader('Content-type' , mimetype);
            response.end(data);
            console.log(url, mimetype );
        } else {
            console.log ('file not found: ' + url[0]);
            response.writeHead(404, "Not Found");
            response.end();
        }
    });
});
var io   = require('socket.io')(serveur);

/* A utiliser si on veut travailler en local, donc pendant la phase de développement */
serveur.listen(80);
//_________________________________________________________________________
/* A utiliser à la fin pour que le site soit en ligne sur always data */
//serveur.listen(process.env.PORT, process.env.IP);
//_________________________________________________________________________

// Gestion du Chat
io.on('connection', function (socket) {
  socket.emit('welcome', { message: 'Vous êtes connecté au chat !' });
  socket.on('message', function (data) {
    console.log('Message: ' + data);
    socket.broadcast.emit('message', {message: data});
  });

// Gestion du TIR et mise à jour de la BD en cas de tir
  socket.on('shot', function (data) {
    socket.emit('shot', data);

    data["Touche"].forEach(function(element){
      db.none("UPDATE joueurs SET capa = "+element[1]+"WHERE id = "+element[0])
      .then()
      .catch(error => {
          console.log(error);
      });
      db.any('SELECT * FROM joueurs ORDER BY id;')
          .then(json => {
              console.log(json);

              socket.emit('bdd',json);

          })
          .catch(error => {
              console.log(error);
          });

    });


  });

//Connection à la base de donnée
  const pgp = require('pg-promise')(/* initialization options */);

// Gestion de connexion à la base de données en ligne
  const cn = {
      host: 'postgresql-vincentheau-capa.alwaysdata.net', // server name or IP address;
      port: 5432,
      database: 'vincentheau-capa_bd',
      user: 'vincentheau-capa',
      password: 'Capa2021'
  };

  const db = pgp(cn);

// Récupération des éléments de la base de donnée
  db.any('SELECT * FROM joueurs ORDER BY id;')
      .then(json => {
          console.log(json);
          socket.emit('bdd',json);

      })
      .catch(error => {
          console.log(error);
      });
});
