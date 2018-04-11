import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';
import { Player } from './../models/player';
import { Room } from './../models/room';
import { Img } from './../models/img';
import * as firebase from 'firebase/app';
import { MatchmakingComponent } from '../matchmaking/matchmaking.component';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {

  message = 'Attente d\'un joueur';
  roomId: string;
  username: string;
  room: Room = new Room();
  myPlayerId: number;
  imgbalise: string = '';
  htmlStr: string = '';
  card:boolean = true;
  img: Observable<any[]>;
  rooms: Observable<any[]>;
  constructor(private route: ActivatedRoute, authService: AuthService, 
              private db: AngularFirestore, private router: Router, public auth: AuthService) {
    this.img = db.collection('img').valueChanges();
    this.rooms = db.collection('rooms').valueChanges();

  }
  ngOnInit() {
    
    this.roomId = this.route.snapshot.paramMap.get('id');
    this.username = this.route.snapshot.paramMap.get('username');
    this.username = this.username.replace(/\s/g, '');
    this.db
      .doc<Room>('rooms/' + this.roomId)
      .valueChanges()
      .subscribe((room) => {
        this.room = room;
        this.myPlayerId = room.players[0].name === this.username ? 0 : 1;
        if (room.players.length === 2) {
          this.message = 'Starting game';
          if (this.room.players[0].url && this.room.players[0].name === this.username) {
            this.htmlStr = '<img src=' + this.room.players[0].url +
             ' alt = "imgToFind" ><h3>' + this.room.players[0].img + '</h3>';
            this.card = false;
          } else if (this.room.players[1].url && this.room.players[1].name === this.username) {
            this.htmlStr = '<img src=' + this.room.players[1].url +
             ' alt = "imgToFind" ><h3>' + this.room.players[1].img + '</h3>';
            this.card = false;
          }
        }
      });
    
    
  }
  test() {
    if (this.room.players[0].name === this.username) {
      this.room.turn = 1;
    } else if (this.room.players[1].name === this.username) {
      this.room.turn = 0;
    }
    this.db.doc('rooms/' + this.roomId).update(JSON.parse(JSON.stringify(this.room)));
  }
  isMyTurn(): boolean {
    return this.room && this.room.turn !== undefined && 
    this.room.players[this.room.turn].name === this.username;
    
  }
  mainMenu() {
    this.router.navigate(['home']);
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  randomCard() {
    let imgbalise;
    this.db
      .collection<Img>('img')
      .valueChanges()
      .take(1)
      .subscribe((img) => {
        // if (this.room.players[0].url && this.room.players[0].name === this.username) {
        //   this.htmlStr = '<img src=' + this.room.players[0].url +
        //  ' alt = "imgToFind" ><h3>' + this.room.players[0].img + '</h3>';
        //   this.card = false;
        //   this.room.turn = 0;
        // } else if (this.room.players[1].url && this.room.players[1].name === this.username) {
        //   this.htmlStr = '<img src=' + this.room.players[1].url +
        //  ' alt = "imgToFind" ><h3>' + this.room.players[1].img + '</h3>';
        //   this.card = false;
        //   this.room.turn = 1;
        // }else {
        imgbalise = img[this.getRandomInt(23)];
        // this.htmlStr = '<img src=' + imgbalise.urlImg +
        //  ' alt = "imgToFind" ><h3>' + imgbalise.name + '</h3>';
        // this.card = false;
        this.updateRoom();
        if (this.room.players[0].name === this.username) {
          this.room.players[0].img = imgbalise.name;
          this.room.players[0].url = imgbalise.urlImg;
          this.db.doc<Room>('rooms/' + this.roomId).update(this.room);
          this.htmlStr = '<img src=' + this.room.players[0].url +
         ' alt = "imgToFind" ><h3>' + this.room.players[0].img + '</h3>';
          this.card = false;
          this.room.turn = 0;
        } else if (this.room.players[1].name === this.username) {
          this.room.players[1].img = imgbalise.name;
          this.room.players[1].url = imgbalise.urlImg;
          this.db.doc<Room>('rooms/' + this.roomId).update(this.room);
          this.htmlStr = '<img src=' + this.room.players[1].url +
         ' alt = "imgToFind" ><h3>' + this.room.players[1].img + '</h3>';
          this.card = false;
          this.room.turn = 1;
        }
        // }
        console.log(this.room.players[1].url);
      });
   
  }
  updateRoom() {
    this.db.doc<Room>('rooms/' + this.roomId).update(this.room);
  }
  // value = '';
  onEnter(value: string) { 
    const data = { question:value, answer:null, user:'' };
    this.room.answers.push(data);
    this.test();  
    // this.room.answers[this.room.answers.length - 1].user = this.username;
    // this.db.doc<Room>('rooms/' + this.roomId).update(this.room);  
    console.log(this.username);
    console.log(this.room.turn);
  }
  isMyTurnToAnswer() {
    if (this.room.answers.length > 0 &&
       this.room.answers[this.room.answers.length - 1].user !== this.username &&
       this.room.answers[this.room.answers.length - 1].answer !== undefined) {
      return true; 
    }
    return false;
  }
  sendAnswer(val) {
    this.room.answers[this.room.answers.length - 1].answer = val;
    this.room.answers[this.room.answers.length - 1].user = this.username;
    this.db.doc<Room>('rooms/' + this.roomId).update(this.room);
  }
  lastQuestion() {
    return this.room.answers[this.room.answers.length - 1].question;    
  }
  lastResponse() {
    if (this.room.answers !== undefined) {
      if (this.room.answers[this.room.answers.length - 1].answer !== undefined && 
      this.room.answers[this.room.answers.length - 1].answer === true) {
        return 'Question: ' + this.room.answers[this.room.answers.length - 1].question +
    ' Reponse: Oui';
      }
      if (this.room.answers[this.room.answers.length - 1].answer !== undefined &&
       this.room.answers[this.room.answers.length - 1].answer === false) {
        return 'Question: ' + this.room.answers[this.room.answers.length - 1].question +
    ' Reponse: Non';
      }
    }
  }

}
