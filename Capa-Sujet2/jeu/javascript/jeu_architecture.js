
// **********************************************************************************************************************
//                                    Script qui gère la connection à la base de donnée et le jeu
//                                            C'est le coeur de l'architecture du jeu
//                                               HEAU Vincent- Sujet 2 - CAPA
// **********************************************************************************************************************

// Pour mieux comprendre le code, lisez d'abord la documentation programmeur

////////////////////////////////////////////////////////
//PARTIE 1: GESTION D'AFFICHAGE EN CAS DE TEST UNITAIRE
////////////////////////////////////////////////////////

// Gestion de la visibilté de la div des tests unitaires avec un bouton
var tests_unitaires = document.getElementById('tests_unitaires');
var dev = document.getElementById('dev');
var gestion_tir = document.getElementById('gestion_tir');


/* Si la case est cochée, on affiche le tableau permettant de faire les tests unitaires. De plus, la carte change
de localisation et se place par défaut au niveau du Cervin (choix arbitraire). Sur cette montagne, un jeu de
joueurs est affiché permettant de tester que les fonctions tir et protection marchent correctement.
(plus d'informations dans la documentation programmeur)
*/

function maj_affichage(){
  /*Fonction qui change l'affichage et les paramètres si la case 'Mode Développement' est cochée*/
  if (dev.checked == false){
    mode='jeu'; //Initialisation d'une variable globale mode qui sera utilisée par la suite
    tests_unitaires.style.display = "none";
    gestion_tir.style.display = "none";
  }
  else {
    mode='dev';
    tests_unitaires.style.display = "block";
    gestion_tir.style.display = "block";
  }
};


function maj_tir(){
  /*Fonction qui change le tir selon que l'utilsateur sélectionne tir tournant ou tir orienté*/
  if (tir_oriente.checked == false){
    mode_jeu=1; //Initialisation d'une variable globale mode_jeu qui sera utilisée par la suite dans la fonction de tir
  }
  else if (tir_tournant.checked == false){
    mode_jeu=2;
  }
  else{
    mode_jeu=2; //Le mode de tir par défaut est un tir orienté (condition de jeu réelles)
  }
};


// Mise à jour des paramètres et paramètres par défaut

maj_affichage(); //un premier appel de la fonction mettant à jour l'affichage
maj_tir(); //un premier appel de la fonction mettant à jour le mode de tir
dev.addEventListener('click',maj_affichage); // suivi d'une mise à jour au clic

// Gestion des modes de tir (Tir tournant ou tir orienté)
// La gestion des modes de tir n'est possible qu'en mode développement




///////////////////////////////
//PARTIE 2: GESTION DU SERVEUR
///////////////////////////////

/* A utiliser si on veut travailler en local, donc pendant la phase de développement */
var socket = io('http://localhost')

//__________________________________________________________________________
/* A utiliser à la fin pour que le site soit en ligne sur always data */
//var socket = io('https://vincentheau-capa.alwaysdata.net')
//__________________________________________________________________________



/////////////////////////////////////////////////////////////////////////////
//PARTIE 3: AFFICHAGE DE LA CARTE, DES JOUEURS, GESTION DU CHAT ET DU PSEUDO
////////////////////////////////////////////////////////////////////////////

// Les websockets concernant le chat
socket.on('welcome', function (data) {
afficheMessage(data.message);
});
socket.on('message', function (data) {
afficheMessage(data.message);
});


// la websocket permettant d'afficher les joueurs de la base de données
socket.on('bdd', function (data) {

// affichage des joueurs sur la carte
affichage(data);

// affichage des joueurs en un tableau (pour le mode développement)
remplissage(data);
// Mise à jour de la variable global des joueurs
joueurs=data;
});


// Ici, le code qui permet le fonctionnement du chat

var form = document.getElementById('chatbox');
form.addEventListener('submit', function (e) {
socket.emit('message', form.elements['message'].value);
afficheMessage(form.elements['message'].value);
form.elements['message'].value = '';
e.preventDefault();
});

function afficheMessage (msg) {
var message = document.createElement('p');
message.innerHTML = msg;
document.getElementById('messages').appendChild(message);
}



// Fonction d'affichage et de remplissage utilisée précédemment

function affichage(data) {
  /*Affiche les joueurs de la base de données sur la carte*/
 for (let joueur of data) {
   if (joueur.camp==1){
     L.circle([joueur.lat, joueur.lng], {color: "red", radius: 5}).addTo(carte);
   }
   else if (joueur.camp==2){
     L.circle([joueur.lat,joueur.lng], {color: "blue", radius: 5}).addTo(carte);
   }
 }
};

function remplissage(data) {
  /*Affiche les joueurs de la base de données dans un tableau en dessous de la carte, visible en mode développement*/
  document.getElementById('joueur').innerHTML="<tr><th>Identifiant</th><th>Camp</th><th>Latitude</th><th>Longitude</th><th>Orientation</th><th>Capa</th><th>Etat</th><th>Lat_Cible</th><th>Long_Cible</th><th>Rayon</th><th>Action</th><th>Recharge</th><th>Attaquant</th><th>Pseudo</th></tr>";
  for (let joueur of data) {
    var ligne="<tr><td>"+joueur.id+"</td><td>\
                   "+joueur.camp+"</td><td>\
                   "+joueur.lat+"</td><td>\
                   "+joueur.lng+"</td><td>\
                   "+joueur.orientation+"</td><td>\
                   "+joueur.capa+"</td><td>\
                   "+joueur.etat+"</td><td>\
                   "+joueur.lat_cible+"</td><td>\
                   "+joueur.lon_cible+"</td><td>\
                   "+joueur.rayon+"</td><td>\
                   "+joueur.action+"</td><td>\
                   "+joueur.recharge+"</td><td>\
                   "+joueur.attaquants+"</td><td>\
                   "+joueur.pseudo+"</td></tr>"
    document.getElementById('joueur').innerHTML+=ligne;
  }
};






//____________________________Recupération du pseudo et affichage ____________________________

var pseudo=document.location.search;

pseudo=pseudo.split('=')[1];
document.getElementById('capacite').innerHTML += "<p><u>Joueur :</u> " +pseudo +" <p>" ;

//_________________________Carte Leflet , affichage_______________________


var carte = L.map('map', {zoomControl: false}).setView([45.9772381, 7.658274],16);
//centrage arbitraire de la carte puisque qu'elle est amenée à être centrée sur le joueurs

L.control.zoom({
  position: 'topright'
}).addTo(carte);

L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetmap</a> <b>Vincent Heau  </b> <i>Projet Capa Sujet n°2 réalisé en 2022 dans le cadre du cours de Webmapping</i>'
}).addTo(carte);

// Coordonnées de base en mode développement, au niveau du Cervin
lat=45.9772381;
lng=7.658274;



////////////////////////////////////////////////////////////////
//PARTIE 4: MIS EN ROUTE DES FONCTIONNALITES & JEU
////////////////////////////////////////////////////////////////

// Récupération des boutons du jeu pour ajouter des écouteurs d'évènement

const tir=document.getElementById("tir");
const protection=document.getElementById("protection");
const assaut=document.getElementById("assaut");
//const observation=document.getElementById("observation");
//const recuperation=document.getElementById("recuperation");

//Joueur
// On le représente pas un cercle
var joueur = L.circle([lat, lng], {color: "black", radius: 5})
joueur.addTo(carte);


/* ------------------------- Fin de l'initialisation ------------------------------- */

//________________________________Coeur du jeu___________________________________
//Mises à jour du système si la localisation change

navigator.geolocation.watchPosition(function (position) {
  /* La fonction de geolocation s'applique dès qu'un changement de position est détecté*/
  if (mode=='dev'){
    /* Si un changement de position est détecté en mode développement, on reste toujours au même endroit sur le Cervin*/
    lat=45.9772381;
    lng=7.658274;
  }
  else{
      /* Si un changement de position est détecté en mode normal, on change de postion*/
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    //Sauvegarde en cas de passage en mode développement
    lat_save=lat
    lng_save=lng
    /*
     La Sauvegarde permet de revenir plus rapidement à la position de l'utilisateur
     en revenant à la position qu'il avait avant de passer en mode développement.
     Si l'utilisateur bouge, la position se réactualise automatiquement avec WatchPosition
     */

  }
  // La fonction jouer permet de faire les actions requises en cas d'appuie sur les boutons. Elle est décrite plus loin
  jouer(lat,lng);
});


dev.addEventListener('click',function(){
  /* Si le joueur clique sur le mode développement, alors automatiquement la position est actualisé au Cervin*/
  if (dev.checked == true){
    lat=45.9772381;
    lng=7.658274;
    jouer(lat,lng);
  }
  else{
    // Réactualisation de la position quand on quitte le mode développement
    jouer(lat_save,lng_save);
  }
});





////////////////////////////////////////////
//PARTIE 4: FONCTIONS UTILISEES POUR LE JEU
////////////////////////////////////////////

function distance(depart,arrivee) {
 /* renvoie la distance en km entre deux points donnés*/
 var lon1 = toRadian(depart[1]);
 var lat1 = toRadian(depart[0]);
 var lon2 = toRadian(arrivee[1]);
 var lat2 = toRadian(arrivee[0]);

 var deltaLat = lat2 - lat1;
 var deltaLon = lon2 - lon1;

 var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
 var c = 2 * Math.asin(Math.sqrt(a));
 var rayon_terre = 6371;
 var d = c * rayon_terre;
 return d;

}

function calcul_angle(depart,arrivee) {
 /* Calcul l'angle entre deux points données */
 var lon1 = toRadian(depart[1]);
 var lat1 = toRadian(depart[0]);
 var lon2 = toRadian(arrivee[1]);
 var lat2 = toRadian(arrivee[0]);

 var deltaLat = lat2 - lat1;
 var deltaLon = lon2 - lon1;

 var y = Math.sin(deltaLon) * Math.cos(lat2);
 var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(deltaLon);

 var angle = toDegrees(Math.atan2(y, x));
 var angle =mod(angle,360);
 return angle;
}

function toRadian(degree) {
/* Converti un angle en radian */
 return degree*Math.PI/180;
};

function toDegrees(radian) {
/* Converti un angle en degré */
 return radian*180/Math.PI;
};

function mod(n, m) {
  /* Calcul du modulo, pour les angles */
  var remain = n % m;
  return Math.floor(remain >= 0 ? remain : remain + m);
};


function calcHypotenuse(a, b) {
  /* Calcul de l'hypothénuse */
  return (Math.sqrt((a * a) + (b * b)));
}



//----------------------------------------------------------------------------------------------------------------------------
//                      Fonction principale gérant les opérations en cas d'appuie sur les boutons
//----------------------------------------------------------------------------------------------------------------------------

function jouer(lat,lng){
  /* C'est la fonction principale.
   Elle gère les boutons:
                   - ASSAUT (juste la partie graphique)
                   - TIR (la partie graphique avec le cône et la partie technique avec le changement de score)
                   - PROTECTION (la partie graphique avec le cône de protection)
  */

  // Nettoyage de la carte
  try{
    tir1.remove(carte);
    tir2.remove(carte);
  }
  catch{}

  //__________Initialisation______________

    //Recentrage de la carte sur le joueur
    carte.setView([lat, lng]);

    //Recentrage du cercle identifiant le joueur sur la carte
    joueur.setLatLng([lat,lng]);

    //Création et affichage du secteur de tir

    var center = turf.point([lng,lat]); // position du joueur
    /* D'après la documentation turf.sector, la valeur du rayon est par défaut en kilomètre*/

    var rayon1 = 0.088; // rayon du secteur où le tir a un effet
    var rayon2 = 0.028; // rayon du secteur où le tir a l'effet maximal

    var orientation = 0; //orientation initiale du téléphone, par défaut 0
    // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
    var bord1 = orientation-48;
    var bord2 = orientation+48;


    // Création des secteurs angulaires
    var secteur = turf.sector(center, rayon1, bord1, bord2);
    var secteur_coeur = turf.sector(center, rayon2, bord1, bord2);

    // Style des secteurs angulaires
    var style1 = {
     "color": "orange",
     "opacity": 0.5
    };
    var style2 = {
     "color": "red",
     "opacity": 0.5
    };

    var styleprotection = {
     "background": "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
     "opacity": 0.9
    };

    // Affichage des secteurs angulaires avec leur style sur la carte
    tir1=L.geoJSON(secteur,{style: style1});
    tir2=L.geoJSON(secteur_coeur,{style: style2});

  ///////////
  //  TIR  //
  ///////////
    // On appuie sur le bouton pour afficher le cône et on relâche pour tirer

    /*Si le polygone de visée est affiché (le joueur est en train d'effectuer un tir),
    il est retiré de la carte dans son état actuel. On modifie ses coordonnées pour coller à celles
    du joueur et on le ré-ajoute à la carte */

    tir.onmousedown=function(){
      maj_tir(); // Dès qu'il y a un tir, on met à jour pour savoir de quel tir il s'agit.

      var orientation = 0;

      if (mode_jeu==1){
        // mode_jeu à 1 indique en cas de tir tournant (voir documentation utilisateur et programmeur)
      var interval = setInterval(cone, 100);

      function cone(){
        /* On affiche le cône de visé */

        tir1.remove(carte);
        tir2.remove(carte);

        orientation += 15; //orientation initiale du téléphone, par défaut 0
        // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
        var bord1 = orientation-48;
        var bord2 = orientation+48;

        // Création des secteurs angulaires
        var secteur = turf.sector(center, rayon1, bord1, bord2);
        var secteur_coeur = turf.sector(center, rayon2, bord1, bord2);

        tir1=L.geoJSON(secteur,{style: style1});
        tir2=L.geoJSON(secteur_coeur,{style: style2});

        tir1.addTo(carte);
        tir2.addTo(carte);

       }
      }

      else if (mode_jeu==2){
        // mode_jeu à 2 indique en cas de tir orienté (voir documentation utilisateur et programmeur)
        on_tir=1;
        orientation = 0; //orientation initiale du téléphone, par défaut 0
        // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
        var bord1 = orientation-48;
        var bord2 = orientation+48;

        // Création des secteurs angulaires
        var secteur = turf.sector(center, rayon1, bord1, bord2);
        var secteur_coeur = turf.sector(center, rayon2, bord1, bord2);

        tir1=L.geoJSON(secteur,{style: style1});
        tir2=L.geoJSON(secteur_coeur,{style: style2});

        tir1.addTo(carte);
        tir2.addTo(carte);
          if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", function(event){
              /* Recupération de l'orientation de l'ordianteur ou du téléphone */
              if (on_tir==1){
                tir1.remove(carte);
                tir2.remove(carte);
                // alpha : rotation autour de l'axe z
                var rotateDegrees = event.alpha;
                // gamma : de gauche à droite
                var leftToRight = event.gamma;
                // bêta : mouvement avant-arrière
                var frontToBack = event.beta;

                orientation = -rotateDegrees; //orientation initiale du téléphone, par défaut 0
                // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
                var bord1 = orientation-48;
                var bord2 = orientation+48;

                // Création des secteurs angulaires
                var secteur = turf.sector(center, rayon1, bord1, bord2);
                var secteur_coeur = turf.sector(center, rayon2, bord1, bord2);

                tir1=L.geoJSON(secteur,{style: style1});
                tir2=L.geoJSON(secteur_coeur,{style: style2});

                tir1.addTo(carte);
                tir2.addTo(carte);

              }

            }, true);
          }

      };



      tir.onmouseup=function(){
        /* Lorsque l'on avait appuyé sur le bouton de tir, il s'agissait simplement d'afficher les cônes.
         Lorsqu'on relâche le bouton, c'est le tir qui se met en place et le code qui suit est plus
         'calculatoire'. Pour bien le comprendre, il faut lire les règles du jeu */
        clearInterval(interval);
        on_tir=0;

          tir1.remove(carte);
          tir2.remove(carte);

          var Touche=[];
          coord_centre=[joueur._latlng["lat"],joueur._latlng["lng"]];

          //test pour vérifier si le joueur est bien dans le polygone
          for (let i = 0; i < joueurs.length; i++){
            coord=[joueurs[i].lat,joueurs[i].lng];
            // Calcul de l'angle entre les deux joueurs
            angle=calcul_angle(coord_centre,coord);
            orientation=mod(orientation,360);
            var inside = (angle<=orientation+48 && angle>=orientation-48);

            if (distance(coord,coord_centre)<=0.028 && inside){
              Touche.push([joueurs[i].id,joueurs[i].capa-58])
            }
            else if (distance(coord,coord_centre)>=0.028 && distance(coord,coord_centre)<=0.088 && inside){
              //Calcul la perte de capacité
              // Selon une fonction y= ax+b puisque perte linéaire et donc a=-29/20 et b=1276/15
              var a=-29/20;
              var b=1276/15;
              //Calcul de la perte de capacité en fonction de la distance
              var perte=Math.round(a*distance(coord,coord_centre)+b);

              Touche.push([joueurs[i].id,joueurs[i].capa-perte]);

            }
            // Affiche dans la console pour vérification
            console.log('Informations sur les joueurs touchés envoyé par websocket :')
            console.log(Touche);
          }


          //websocket permettant la mise à jour de la base de donnée
          socket.emit("shot", {Touche: Touche})
          // Affiche dans la console pour vérification
          console.log("Tir effectué");
      };

      console.log("Preparation du tir");


    };

    //////////////////
    //  PROTECTION  //
    //////////////////
    /* L'appuie sur le bouton protection permet une protection dans la direction du téléphone.
    Le bouton devient vert. L'arrêt de la protection de fait en cliquant à nouveau sur le bouton */

    i=0 // Variable qui indique si la protection est activée ou pas (1 ou 0)

    protection.onclick=function(){
      maj_tir();
      try {
        angle_protect.remove(carte);

      }
      catch{
      }
      if (i==0){
        // Si la protection n'était pas activée, alors on l'active
        i=1;
        if (mode_jeu==1){
          alert('Pas de protection possible en mode tournant');
        }
        else if (mode_jeu==2){
          protection.style.backgroundColor = 'green';
          console.log("Début de la protection");
          on=1;
          orientation = 0; //orientation initiale du téléphone, par défaut 0
          // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
          var bord1 = orientation-48;
          var bord2 = orientation+48;

          // Création du secteur angulaire de protection
          var secteur = turf.sector(center, rayon1, bord1, bord2);

          angle_protect=L.geoJSON(secteur,{style: styleprotection});

          angle_protect.addTo(carte);

            if (window.DeviceOrientationEvent) {
              window.addEventListener("deviceorientation", function(event){
                // On récupère l'orientation pour ajuster la postion du cône
                if (on==1){
                  angle_protect.remove(carte);
                  // alpha : rotation autour de l'axe z
                  var rotateDegrees = event.alpha;
                  // gamma : de gauche à droite
                  var leftToRight = event.gamma;
                  // bêta : mouvement avant-arrière
                  var frontToBack = event.beta;

                  orientation = -rotateDegrees; //orientation initiale du téléphone, par défaut 0
                  // A partir de l'orientation, on peut définir les bords (48° de part et d'autre)
                  var bord1 = orientation-48;
                  var bord2 = orientation+48;

                  // Création du secteur angulaire de protection
                  var secteur = turf.sector(center, rayon1, bord1, bord2);

                  angle_protect=L.geoJSON(secteur,{style: styleprotection});

                  angle_protect.addTo(carte);
                  //*handleOrientationEvent(frontToBack, leftToRight, rotateDegrees);
                }

              }, true);
        }}
      }
      else if (i==1){
        // Sinon on désactive la protection
        i=0;
        on=0;
        angle_protect.remove(carte);
        protection.style.backgroundColor = 'grey';
        console.log("Fin de la protection");
      }
    };

    //////////////
    //  ASSAUT  //
    //////////////

    /* Simple affichage du rayon dans lequel on fait un assaut */
    i=0
    assaut.onmousedown=function(){
      var zone_assaut = L.circle([lat, lng], {color: "red", radius: 18})
      zone_assaut.addTo(carte);
      assaut.onmouseup=function(){
        zone_assaut.remove(carte);
      };
    };

}
