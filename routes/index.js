/*
 * GET Individual Video
 */

exports.watch = function (req, res) {
   res.render('video', {
      title: 'Watch',
      vid: req.params.id
   });
};
