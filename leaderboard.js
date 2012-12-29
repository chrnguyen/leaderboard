// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

Validation = {
  clear: function(){
    return Session.set("validationerror", undefined);
  },
  set_error: function (message){
    return Session.set("validationerror", message);
  },
  valid_name: function(name){
    this.clear();
    if (name.length == 0){
      this.set_error("please enter something");
      return false;
    } else if (this.player_exists(name)){
      this.set_error("person already exists! try entering something new");
      return false;
    } else{
      return true;
    }
  },
 player_exists: function(name){
   return Players.findOne({name:name});
 }
};

if (Meteor.isClient) {

  Template.add_player.validationerror = function(){
    return Session.get("validationerror");
  };

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };
  Template.player.if_selected = function () {
    //console.log(Session.equals("selected_player", this._id) ? true : false);
    return Session.equals("selected_player", this._id) ? true : false;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.add_player.events({
    'click input.add, keydown': function(e){
      //console.log(e.keyIdentifier);
      if(e.keyIdentifier=='Enter'||e.keyIdentifier==undefined){
        var entered_player = document.getElementById('player_name').value;
        //console.log(entered_player);
        if (Validation.valid_name(entered_player)){
          Players.insert({name: entered_player, score: 0});
          document.getElementById('player_name').value='';
        }
      }
      else{
      }
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },

    'click .minus': function(){
      Players.update(this._id,{$inc:{score:-1}});
    },

    'click .add': function(){
      Players.update(this._id, {$inc:{score:1}});
    }

  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  /*
  Players.allow({
    insert: function (userId, doc){
      return true;
    },
    update: function (userId, docs, fields, modifier){
      return true;
    },
    remove: function (userId, docs){
      return false;
    }
  });*/

  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = [];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: 0});
    }
  });
}
