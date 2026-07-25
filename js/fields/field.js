const UI_FIELDS = new Map();
const UI_FIELDS_CONFIGURATION_PREPARE = new Map();
const UI_FIELDS_CONFIGURATION = new Map();

function ui_fields_wrap_listener(name, callback) {
    if (
        name === 'input' &&
        typeof callback === 'function' &&
        callback === window.ui_render_selected_card &&
        window.PERF_SAFE_UPDATES?.scheduleInputPreviewRenders &&
        typeof window.ui_render_selected_card_deferred === 'function'
    ) {
        return window.ui_render_selected_card_deferred;
    }
    return callback;
}

/**
 * Represents a data-bound form field that synchronizes DOM input elements
 * with global state objects.
 *
 * Supports:
 * - Inputs referenced by `id` or groups referenced by `name`
 * - Default value resolution via `"Object.key"` or `default_Object()`
 * - Automatic syncing on `input` and `change` events
 * - Optional custom value getters and event listeners
 */
class Field {

    /**
     * Returns the identifier of an options object (id or name).
     * @param {{id?: string, name?: string}} x
     * @returns {string}
     */
    static identifier(x) {
        return x.id || x.name;
    }

    #preventInternalEvents = false;

    /**
     * Resolve a property description such as `"object.key"` or `[fn, "key"]`
     * into: { dataName, key, data, value }
     *
     * @private
     * @param {string | [Function,string]} property
     * @returns {{dataName: string|Function, key: string, data: Object|Function, value: any}}
     * @throws {Error}
     */
    #getPropertyData(property) {
        let _property = property;

        if (typeof _property === 'string') {
            _property = _property.split('.');
        }

        if (Array.isArray(_property) && _property.length === 2) {
            const [dataName, key] = _property;

            // function returning a data object
            if (typeof dataName === 'function') {
                const data = dataName;
                const result = data();
                return { dataName, key, data, value: result?.[key] ?? null };
            }

            if (typeof dataName === 'string') {
                // name of a function returning a data object
                if (typeof window[dataName] === 'function') {
                    const data = window[dataName];
                    const result = data();
                    return { dataName, key, data, value: result?.[key] ?? null };
                }
                // "objectName.key"
                const data = window[dataName];
                return { dataName, key, data, value: data?.[key] ?? null };
            }
        }

        throw new Error(`Field's property or defaultProperty invalid value`);
    }

    /**
     * @typedef {Object} FieldOptions
     * @property {string|[Function,string]} property
     *      Path such as `"object.key"` or `[() => object, "key"]`.
     *
     * @property {string|[Function,string]} [defaultProperty]
     *      Optional default value path.
     *
     * @property {string} [id]
     *      The element id (for single element fields).
     *
     * @property {string} [name]
     *      The name of the element group (for radios).
     *
     * @property {(field: Field) => void} [init]
     *      Optional callback invoked after setup.
     *
     * @property {Array.<[string, EventListener]>} [events]
     *      Additional listeners: `[["click", handler, options]]`.
     *      If "handler" is a string, then eventListeners[handler] will be used.
     *
     * @property {any} [eventListeners]
     *      Optional map of event handler functions.
     *
     * @property {(value:any)=>any} [valueGetter]
     *      Value parser/transformer. Defaults to:
     *      - Boolean for checkboxes
     *      - String for others
     */

    /**
     * Create a new Field.
     * @param {FieldOptions} options
     * @throws {Error}
     */
    constructor(options) {
        const { property, defaultProperty, name, id, init, events, eventListeners, valueGetter } = options;

        if (!id && !name) throw new Error(`Field's id or name are required.`);
        if (id && name) throw new Error(`Field's name must be omitted when an id is provided.`);
        if (!property) throw new Error(`Field's property is required.`);

        this.options = options;
        this.events = events;

        // Property linking
        const propertyData = this.#getPropertyData(property);
        this.key = propertyData.key;
        this.data = propertyData.data;

        // Default value resolution
        if (defaultProperty) {
            const dp = this.#getPropertyData(defaultProperty);
            this.defaultValue = dp.value;
        } else {
            const dp = this.#getPropertyData([`default_${propertyData.dataName}`, propertyData.key]);
            this.defaultValue = dp.value;
        }

        // DOM element lookup
        let el = null;
        let type = '';
        let isList = false;

        if (id) {
            el = document.getElementById(id);
            if (!el) throw new Error(`Field's element with id="${id}" not found`);
            this.id = id;
            type = el.type;
        } else {
            const list = document.getElementsByName(name);
            if (!list.length) throw new Error(`Field's elements with name="${name}" not found`);
            el = Array.from(list);
            this.name = name;
            isList = true;
            type = 'radioGroup';
        }

        /** @type {HTMLElement|HTMLElement[]} */
        this.el = el;
        /** @type {string} */
        this.type = type;
        /** @type {boolean} */
        this.isList = isList;

        // Value parser
        if (valueGetter) this.valueGetter = valueGetter;
        else if (type === 'checkbox') this.valueGetter = Boolean;
        else this.valueGetter = String;

        // Initial value
        let _value = this.getData();
        if (_value === undefined || _value === null) _value = this.defaultValue;
        this.update(_value);

        // Event listeners
        const elements = isList ? el : [el];
        elements.forEach(element => {
            element.addEventListener('input', () => {
                if (this.#preventInternalEvents) return;
                this.setData(this.getValue());
                this.storeData();
            });
            element.addEventListener('change', () => {
                if (this.#preventInternalEvents) return;
                this.setData(this.getValue());
                this.storeData();
            });
            events?.forEach(args => {
                const [ name, callback, options ] = args || [];
                if (typeof callback === 'function') {
                    element.addEventListener(name, ui_fields_wrap_listener(name, callback), options);
                } else if (typeof callback ==='string') {
                    element.addEventListener(name, ui_fields_wrap_listener(name, eventListeners[callback]), options);
                }
            });
        });

        /** @type {JQuery<HTMLElement>} */
        this.$el = $(el);

        init?.(this);
    }

    /**
     * Persist data (uses global `local_store_save()`).
     * @returns {void}
     */
    storeData() {
        local_store_save();
    }

    /**
     * Get the current value from the bound data object.
     * @returns {*}
     */
    getData() {
        const { data, key } = this;
        if (!data) return null;
        if (typeof data === 'function') {
            const result = data();
            return result?.[key] ?? null;
        }
        return data[key];
    }

    /**
     * Update the underlying data value.
     * @param {*} v
     * @returns {void}
     */
    setData(v) {
        const { data, key } = this;
        if (!data) return;
        if (typeof data === 'function') {
            const result = data();
            if (!result) return;
            result[key] = v;
        } else {
            data[key] = v;
        }
    }

    /**
     * Read the current DOM value and parse it using valueGetter.
     * @returns {*}
     */
    getValue() {
        const { el, valueGetter } = this;
        if (!el) return undefined;

        let result;

        switch (this.type) {
            case 'checkbox':
                result = valueGetter(el.checked);
                break;

            case 'radioGroup':
                for (const radio of el) {
                    if (radio.checked) {
                        result = valueGetter(radio.value);
                        break;
                    }
                }
                break;

            case 'select-multiple':
                result = Array
                    .from(el.options)
                    .filter(o => o.selected)
                    .map(o => valueGetter(o.value));
                break;

            default:
                result = valueGetter(el.value);
        }

        return result;
    }

    /**
     * Update the DOM element's displayed value.
     * @param {*} v
     * @returns {void}
     */
    setValue(v) {
        const { el, valueGetter } = this;
        if (!el) return;

        switch (this.type) {
            case 'checkbox':
                el.checked = !!v;
                break;

            case 'radioGroup':
                for (const radio of el) {
                    if (valueGetter(radio.value) === v) {
                        radio.checked = true;
                        break;
                    }
                }
                break;

            case 'select-multiple':
                const arr = Array.isArray(v) ? v : [];
                for (const opt of el.options) {
                    opt.selected = arr.includes(valueGetter(opt.value));
                }
                break;

            default:
                el.value = v ?? '';
        }
    }

    /**
     * Programmatically change the field value and fire input/change events.
     *
     * @param {*} v
     * @param {{updateData?: boolean}} [options]
     * @returns {void}
     */
    changeValue(v, options) {
        let updateData = options?.updateData ?? true;
        if (!updateData) this.#preventInternalEvents = true;

        this.setValue(v);
        this.el.dispatchEvent(new Event('input'));
        this.el.dispatchEvent(new Event('change'));

        if (!updateData) this.#preventInternalEvents = false;
    }

    /**
     * Update only the DOM value without firing events or persisting data.
     * Used for card-selection sync so we can avoid event storms.
     *
     * @param {*} v
     * @returns {void}
     */
    syncValue(v) {
        this.setValue(v);
    }

    /**
     * Reset field to its default value (fires events).
     */
    reset() {
        this.changeValue(this.defaultValue);
    }

    /**
     * Set DOM value, update data, and persist.
     * @param {*} v
     */
    update(v) {
        this.setValue(v);
        this.setData(v);
        this.storeData();
    }
}

/**
 * Create and register a new Field.
 * @param {FieldOptions} options
 * @returns {Field}
 */
function initField(options) {
    const identifier = Field.identifier(options);
    if (UI_FIELDS.has(identifier)) {
        throw new Error(`Field with id or name "${identifier}" already exists.`);
    }
    const field = new Field(options);
    UI_FIELDS.set(identifier, field);
    return field;
}

/**
 * Find a field by identifier or by matching a property value.
 *
 * @param {string} identifier - Property name to match: "id", "name", "el", etc.
 * @param {*} [value] - Value to match.
 * @returns {Field|undefined}
 */
function getField(identifier, value) {
    if (value === undefined) {
        return UI_FIELDS.get(identifier);
    }

    for (const [, field] of UI_FIELDS) {
        if (identifier === 'el' && field.isList) {
            if (field.el.some(e => e === value)) return field;
        } else if (field[identifier] === value) {
            return field;
        }
    }

    return undefined;
}

/**
 * Get a group of fields from UI_FIELDS_CONFIGURATION.
 *
 * @param {string} category
 * @returns {Field[]}
 */
function getFieldGroup(category) {
    return UI_FIELDS_CONFIGURATION
        .get(category)
        .reduce((result, conf) => {
            const field = getField(Field.identifier(conf));
            return [...result, field];
        }, []);
}
