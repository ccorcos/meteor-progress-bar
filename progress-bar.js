Posts = new Mongo.Collection('posts')

if (Meteor.isClient) {

  sub = Meteor.subscribe('posts')

  Template.main.helpers({
    posts: function () {
      return Posts.find()
    },
    progress: function() {
      post = Posts.findOne({subId: sub.subscriptionId}, {sort:{progress:-1}})
      console.log(post)
      return post ? post.progress / post.total : 0
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Posts.find().count() == 0) {
      for (var i = 0; i < 100; i++) {
        Posts.insert({value: i})
      };
    }
  });
  Meteor.publish('posts', function() {
    var pub = this
    var cursor = Posts.find()
    var collectionName = cursor._cursorDescription.collectionName
    var total = cursor.count()
    var i = 0
    cursor.observeChanges({
      added: function (id, fields) {
        fields.subId = pub._subscriptionId
        i++
        fields.progress = i
        fields.total = total
        Meteor._sleepForMs(100)
        pub.added(collectionName, id, fields);
      },
      changed: function (id, fields) {
        pub.changed(collectionName, id, fields);
      },
      removed: function (id) {
        pub.removed(collectionName, id);
      }
    })
  })
}


