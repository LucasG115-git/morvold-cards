function ui_fields_colorfield_color(value) {
    if (!value) return '';
    let foundValue = card_colors[value];
    if (foundValue) return foundValue;
    const valueLowerCase = value.toLowerCase();
    for (const colorKey in card_colors) {
        const colorKeyLowerCase = colorKey.toLocaleLowerCase()
        if (colorKeyLowerCase === valueLowerCase) {
            return colorKey;
        }
    }
    return '';
}

function ui_fields_colorfield_change_handler(field, $selector) {
    const newValue = field.getValue();
    let foundValue = ui_fields_colorfield_color(newValue);
    $selector.colorselector('setColor', foundValue);
    field.el.previousElementSibling.style.backgroundColor = foundValue ? '' : newValue;
    if (!foundValue) {
        field.update(newValue);
        ui_render_selected_card();
    }
}

function ui_fields_colorfield_init(field) {
    const $selector = $(`#${field.id}-selector`);
    let options = '';
    for (const [name, val] of Object.entries(card_colors)) {
        options += `<option value="${name}" data-color="${val}">${name}</option>`;
    }
    $selector.append(options);
    $selector.colorselector({
        callback: function (value, color, title) {
            field.el.previousElementSibling.style.backgroundColor = '';
            field.update(title);
            ui_render_selected_card();
        }
    });
    $selector.next('.dropdown-colorselector').addClass("input-group-addon color-input-addon");
    field.el.addEventListener('change', () => ui_fields_colorfield_change_handler(field, $selector));
    field.el.addEventListener('input', () => ui_fields_colorfield_change_handler(field, $selector));
    ui_fields_colorfield_change_handler(field, $selector);
}
