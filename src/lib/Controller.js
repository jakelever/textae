module.exports = function(editor, presenter, view) {
    return {
        init: function() {
            // Prevent the default selection by the browser with shift keies.
            editor.on('mousedown', function(e) {
                if (e.shiftKey) {
                    return false;
                }
            }).on('mousedown', '.textae-editor__type', function() {
                // Prevent a selection of a type by the double-click.
                return false;
            }).on('mousedown', '.textae-editor__body__text-box__paragraph-margin', function(e) {
                // Prevent a selection of a margin of a paragraph by the double-click.
                if (e.target.className === 'textae-editor__body__text-box__paragraph-margin') return false;
            });

            // Bind user input event to handler
            editor
                .on('mouseup', '.textae-editor__body,.textae-editor__span,.textae-editor__grid,.textae-editor__entity', presenter.event.editorSelected)
                .on('mouseenter', '.textae-editor__entity', function(e) {
                    view.hoverRelation.on($(this).attr('title'));
                }).on('mouseleave', '.textae-editor__entity', function(e) {
                    view.hoverRelation.off($(this).attr('title'));
                });
        }
    };
};
