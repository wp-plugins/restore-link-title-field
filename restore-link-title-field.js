/* global ajaxurl, tinymce, wpLinkL10n, setUserSetting, wpActiveEditor */
var wpLinkTitle;

( function( $ ) {
	var inputs = {};

	wpLinkTitle = {
		init: function() {
			// Put the title field back where it belongs
			$( '.wp-link-text-field' ).before( '<div class="link-title-field"><label><span>' + wpLinkTitleL10n.titleLabel + '</span><input id="wp-link-title" type="text" name="linktitle" /></label></div>' );

			// Move search results lower to avoid overlapping
			$( '<style type="text/css"> .has-text-field #wp-link #search-panel .query-results { top: 235px; } </style>' ).appendTo( 'head' );

			inputs.wrap = $('#wp-link-wrap');
			inputs.submit = $( '#wp-link-submit' );

			// Input
			inputs.url = $( '#wp-link-url' );
			inputs.title = $( '#wp-link-title' );
			inputs.text = $( '#wp-link-text' );
			inputs.openInNewTab = $( '#wp-link-target' );

			inputs.submit.click( function( event ) {
				event.preventDefault();
				event.stopImmediatePropagation();
				wpLinkTitle.update();
			});

			if ( 'undefined' !== typeof wpLink ) {
				wpLink.mceRefresh = wpLinkTitle.mceRefresh;
				wpLink.getAttrs = wpLinkTitle.getAttrs;
				wpLink.updateFields = wpLinkTitle.updateFields;
			}
		},

		mceRefresh: function() {
			var text,
				editor = tinymce.get( wpActiveEditor ),
				selectedNode = editor.selection.getNode(),
				linkNode = editor.dom.getParent( selectedNode, 'a[href]' ),
				onlyText = this.hasSelectedText( linkNode );

			if ( linkNode ) {
				text = linkNode.innerText || linkNode.textContent;
				inputs.url.val( editor.dom.getAttrib( linkNode, 'href' ) );
				inputs.title.val( editor.dom.getAttrib( linkNode, 'title' ) );
				inputs.openInNewTab.prop( 'checked', '_blank' === editor.dom.getAttrib( linkNode, 'target' ) );
				inputs.submit.val( wpLinkL10n.update );
			} else {
				text = editor.selection.getContent({ format: 'text' });
				wpLink.setDefaultValues();
				wpLinkTitle.setDefaultValues();
			}

			if ( onlyText ) {
				inputs.text.val( text || '' );
				inputs.wrap.addClass( 'has-text-field' );
			} else {
				inputs.text.val( '' );
				inputs.wrap.removeClass( 'has-text-field' );
			}
		},

		getAttrs: function() {
			return {
				href: $.trim( inputs.url.val() ),
				title: $.trim( inputs.title.val() ),
				target: inputs.openInNewTab.prop( 'checked' ) ? '_blank' : ''
			};
		},

		update: function() {
			if ( wpLink.isMCE() ) {
				wpLink.mceUpdate();
			} else {
				wpLinkTitle.htmlUpdate();
			}
		},

		htmlUpdate: function() {
			var attrs, text, html, begin, end, cursor, selection,
				textarea = wpLink.textarea;

			if ( ! textarea ) {
				return;
			}

			attrs = wpLinkTitle.getAttrs();
			text = inputs.text.val();

			// If there's no href, return.
			if ( ! attrs.href ) {
				return;
			}

			// Build HTML
			html = '<a href="' + attrs.href + '"';

			if ( attrs.title ) {
				title = attrs.title.replace( /</g, '&lt;' ).replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
				html += ' title="' + title + '"';
			}

			if ( attrs.target ) {
				html += ' target="' + attrs.target + '"';
			}

			html += '>';

			// Insert HTML
			if ( document.selection && wpLink.range ) {
				// IE
				// Note: If no text is selected, IE will not place the cursor
				//       inside the closing tag.
				textarea.focus();
				wpLink.range.text = html + ( text || wpLink.range.text ) + '</a>';
				wpLink.range.moveToBookmark( wpLink.range.getBookmark() );
				wpLink.range.select();

				wpLink.range = null;
			} else if ( typeof textarea.selectionStart !== 'undefined' ) {
				// W3C
				begin = textarea.selectionStart;
				end = textarea.selectionEnd;
				selection = text || textarea.value.substring( begin, end );
				html = html + selection + '</a>';
				cursor = begin + html.length;

				// If no text is selected, place the cursor inside the closing tag.
				if ( begin === end && ! selection ) {
					cursor -= 4;
				}

				textarea.value = (
					textarea.value.substring( 0, begin ) +
					html +
					textarea.value.substring( end, textarea.value.length )
				);

				// Update cursor position
				textarea.selectionStart = textarea.selectionEnd = cursor;
			}

			wpLink.close();
			textarea.focus();
		},

		updateFields: function( e, li ) {
			inputs.url.val( li.children( '.item-permalink' ).val() );
			inputs.title.val( li.hasClass( 'no-title' ) ? '' : li.children( '.item-title' ).text() );
		},

		setDefaultValues: function() {
			// Set description to default.
			inputs.title.val( '' );
		}
	};

	$( document ).ready( wpLinkTitle.init );
})( jQuery );
