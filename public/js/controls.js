export default class Controls {
	constructor(root) {
		this.root = root;
		this.filters = root.querySelectorAll('.filter');
		this.addEventListener('change', this, false);
	}

	handleEvent(e) {
		console.log(e.target.name);
	}


	changeFilter(node) {
		this.filters.forEach((filter) => filter.classList.toggle('checked', this == node));
	}

}


	// filters.eq(0).click(function() {
	// 	$parent.find('.live-message').removeClass('hide');
	// 	$parent.procrastify('update');
	// });
	// filters.eq(1).click(function() {
	// 	$parent.find('.live-message').not('.essentiel').addClass('hide');
	// 	$parent.procrastify('update');
	// });
	// controls.find('.sort > *').click(function() {
	// 	var messages = $parent.find('.live-message').not('.live-new,.pinned');
	// 	messages.find('iframe.twitter-tweet-rendered').each(function() {
	// 		if (!this.id) return;
	// 		var oldTweet = $(this).contents();
	// 		$(this).one('load', function() {
	// 			$(this).contents().find('html').empty().append(oldTweet.children());
	// 		});
	// 	});
	// 	var start = messages.first().prev();
	// 	start.after($.makeArray(messages).reverse());
	// 	$parent.procrastify('update');
	// 	$(this).toggleClass('checked');
	// });
