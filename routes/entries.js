/**
 * InfraNodus is a lightweight interface to graph databases.
 *
 * This open source, free software is available under MIT license.
 * It is provided as is, with no guarantees and no liabilities.
 * You are very welcome to reuse this code if you keep this notice.
 *
 * Written by Dmitry Paranyushkin | Nodus Labs, you, you and you!
 * www.noduslabs.com | info AT noduslabs DOT com
 *
 * In some parts the code from the book "Node.js in Action" is used,
 * (c) 2014 Manning Publications Co.
 *
 */

var Entry = require('../lib/entry');
var FlowdockText = require("flowdock-text");


exports.list = function(req, res, next){

    if (typeof res.locals.user === 'undefined') {
        res.render('entries', {
            title: 'Entries',
            entries: []
        });
        return;
    }



    Entry.getRange(res.locals.user.neo_uid, function(err, entries) {
        if (err) return next(err);


        for (var i = 0; i < entries.length; ++ i) {
              entries[i].text = FlowdockText.autoLinkMentions(entries[i].text,{hashtagUrlBase:"/context/"});
        }


        res.render('entries', {
            title: 'Entries',
            entries: entries,
        });
    });
};

exports.form = function(req, res){
    res.render('post', { title: 'Post' });
};

exports.submit = function(req, res, next){

    // Here we process the data of the POST request, the entry.body and entry.hashtags fields

    var data = req.body.entry;


    // Then we ascribe the data that the Entry object needs in order to survive
    // We create various fields and values for that object and initialize it

    var entry = new Entry({
        "by_uid": res.locals.user.neo_uid,
        "by_id": res.locals.user.neo_id,
        "by_name": res.locals.user.name,
        "contexts": data.contexts,
        "hashtags": data.hashtags,
        "text": data.body

    });

    // Now that the object is created, we can call upon the save function

    entry.save(function(err) {
        if (err) return next(err);
        if (req.remoteUser) {
            res.json({message: 'Entry added.'});
        } else {
            res.redirect('/');
        }
    });
};