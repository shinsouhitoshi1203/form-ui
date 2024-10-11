// form validation module
import Users from "./../assets/modules/02.js";
let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);

let objectInput = {
    // default object to validate is "form__field". this is used to target the validate function for real
    form: "form-13888",
    showStrength: true,
}
function findParent(objInput, expectedClass) {
    let o = objInput, i=0;
    while (!o.classList.contains(expectedClass)) {
        o = o.parentNode; i++;
        if (i>200) return false;
    }
    return o;
}
export default class FormValidation {
    // private properties
    #formID = "";
    #showStrength = true;
    #defaultErrorMessages = {
        null: "This field is required",
        email: "You haven't typed the correct e-mail address",
        passwordMatch: "The password you've just typed doesn't match with the password you typed earlier",
    };
    #ErrorMessages = {};

    // regex defaults
    Regex = {
        email: /^[a-zA-Z0-9._]+[@]{1}[a-z\-0-9]{2,}(?:[.][a-z]{2,})+$/g,
        numberDigit: /[0-9]+/g,
        char: /[a-z]+/g,
        charUp: /[A-Z]+/g,
        special: /[^a-zA-Z0-9]/g
    };

    // constructors
    constructor (objInput) {
        if (!objInput || !objInput?.formID) throw new Error("Unknown form field nodes");
        // getting data
        this.#formID = objInput.formID;
        let def = this.#defaultErrorMessages;
        let defCus = objInput.errorHandler;
        this.#ErrorMessages = 
            (defCus) ? {...def, defCus,} : def;
        // initialize form validations
        this.start();
    }

    // set error messages to invalid fields
    #throwNewMessage(fieldNode, messageHandler) {
        let msgBox = fieldNode.querySelector(".form__field-error-text");
        msgBox.innerText = messageHandler;
        fieldNode.classList.add("form__field--invalid");
    }
    preCheck() {
        const _class = this;
        let allCases = [];
        $$(`#${this.#formID} .form__text-real`).forEach(
            function (txt)  {
                let _this = findParent(txt, "form__field");
                allCases.push(_class.validate(txt,_this,true));
            }
        )
        return allCases.every(e=>e==true);
    }
    // switch field by pressing
    switchNextInput(inputNode, eKey, isSubmit = false) {
        let targetedField = findParent(inputNode, "form__field");
        if (targetedField) {
            targetedField = targetedField.nextElementSibling;
            if (targetedField) {
                targetedField.querySelector("input").focus();
            } else {
                ///// auto submit the form because it is supposed to be the..
                ///// ..last input, its nothing but to submit the form
                if (eKey == "Enter") {
                    if (isSubmit) {
                        if (this.submit(this.toObject())) {
                            this.preventInput();
                        };
                    } 
                } else if (eKey == "ArrowDown") {
                    targetedField = $(`#${this.#formID} .form__field:first-of-type`);
                    targetedField.querySelector("input").focus();
                }
            }
        }
    }
    switchPreviousInput(inputNode) {
        let targetedField = findParent(inputNode, "form__field");
        if (targetedField) {
            targetedField = targetedField.previousElementSibling;
            if (!targetedField) {
                targetedField = $(`#${this.#formID} .form__field:last-of-type`);
                targetedField.querySelector("input").focus();
            } else {
                targetedField.querySelector("input").focus();
            }
        }
    }
    displayStrength(inputNode, fieldNode) {
        function throwStrong(n=1,msg) {
            let type = ["","weak", "medium", "good", "strong"]
            $$('.s').forEach(s=>s.classList.remove("s-select"));
            // show number of bars
            for(let i=0;i<=n-1;++i) fieldNode.querySelectorAll('.s')[i].classList.add("s-select");
            // add text and classes
            fieldNode.querySelector(".password__text").innerText = msg;
            fieldNode.querySelector(".password").setAttribute("class", "password password--show");
            fieldNode.querySelector(".password").classList.add(`password--${type[n]}`)
        }
        function hideStrong() {
            fieldNode.querySelector(".password").setAttribute("class", "password");
            fieldNode.querySelector(".password__text").innerText = "";
        }
        function cal(strInput) {
            let score = 0;
            // length 
            if ((strInput.length >= 7) && (strInput.length <= 10)) {
                score+=1;
            } else if ((strInput.length > 10)) {
                score+=2;
            } 
            // contains
            if ((strInput.match(Regex.char))) {
                score+=1;
            } 
            if ((strInput.match(Regex.charUp))) {
                score+=1;
            } 
            if ((strInput.match(Regex.numberDigit))) {
                score+=1;
            } 
            if ((strInput.match(Regex.special))) {
                score+=1;
            }
            
            return score;
        }
        let inp = inputNode.value;
        let score = cal(inp);  
        switch (score) {
            case 6:
                throwStrong(4, "Unbreakable")
                break;
            case 5:
                throwStrong(3, "Strong")
                break;
            case 4:case 3:
                throwStrong(2, "Medium")
                break;
            case 2:case 1:
                throwStrong(1, "Weak")
                break;
            case 0: 
                hideStrong();
                break;
        }
    }
    preventInput() {
        const formTarget = this.#formID;
        $$(`#${formTarget} .form__text-real`).forEach(
            function (txtbox)  {
                txtbox.disabled = true;
            }
        );
    }
    // set rules for each fields
    rules = {
        isNull(inputNode, fieldNode, messageHandler) {
            return (inputNode.value.length==0)?[inputNode,fieldNode, messageHandler]:true;
        },
        matchPassword(inputNode, fieldNode, messageHandler) {
            let passwordField = "#" + fieldNode.getAttribute("data-from");
            const password_1 = $(passwordField).value;
            const password_2 = inputNode.value;
            return (password_1!=password_2)?[inputNode,fieldNode, messageHandler]:true;
        },
        email(inputNode, fieldNode, messageHandler) {
            const emailAddress = inputNode.value;
            // check if it is matched with the regex
            return (emailAddress.match(Regex.email))?true:[inputNode,fieldNode, messageHandler];
        }
    }

    // validate for a single object!
    validate(inputNode,fieldNode) {
        let messageHandler = "", check_null;
        let type = fieldNode.getAttribute("data-input");
        switch (type) {
            case 'full-name': // --> done
                // handle custom error messages
                // check rules
                messageHandler = this.#defaultErrorMessages.null; 
                return this.rules.isNull(inputNode,fieldNode,messageHandler);
                break;
            case 'email': // --> done
                // check empty first, then check regex 
                messageHandler = this.#ErrorMessages.null;
                check_null = this.rules.isNull(inputNode,fieldNode,messageHandler);
                if (check_null!=true) return check_null;
                messageHandler = this.#ErrorMessages.email;
                return this.rules.email(inputNode,fieldNode,messageHandler);
                break;
            case 'password': // --> done
                // handle custom error messages
                messageHandler = this.#defaultErrorMessages.null;
                // check rules
                return this.rules.isNull(inputNode,fieldNode,messageHandler);
                break;
            case 'confirm-password': // --> done
                // check whether password is null
                messageHandler = this.#ErrorMessages.null;
                check_null = this.rules.isNull(inputNode,fieldNode,messageHandler);
                if (check_null!=true) return check_null;
                // check whether its confirmed password is true;
                messageHandler = this.#ErrorMessages.passwordMatch;
                return this.rules.matchPassword(inputNode,fieldNode,messageHandler);
                break;
            default:
                throw new Error ("Invalid inputs")
                break;
        }
        return true;
    }

    // process object's events
    handleEvents() {
        const formTarget = this.#formID;
        const _class = this;
        function allowThrowMessage([,fieldNode,messageHandler]) {
            _class.#throwNewMessage(fieldNode, messageHandler);
        }
        document.addEventListener("DOMContentLoaded", function () {
            $$(`#${formTarget} .form__text-real`).forEach(
                (txtbox)=>{
                    txtbox.addEventListener(
                        "focus",
                        function (e) {
                            let _this = findParent(this, "form__field");
                            _this.classList.add('form__field--active');
                            
                            // only show password when a password is typed
                            if (_class.#showStrength) 
                                if ((this.getAttribute("type")=="password")) {
                                    if (this.getAttribute("placeholder")=="Password") {
                                        _this.querySelector(".password").classList.add("password--show");
                                    }
                                };
                            
                            e.stopPropagation();
                        }
                    );
                    txtbox.addEventListener(
                        "blur",
                        function (e) {
                            let _this = findParent(this, "form__field");
                            // remove focus event
                            _this.classList.remove('form__field--active');
                            // retrieve message for object:;

                            // validate each element
                            let result = _class.validate(txtbox, _this);

                            // if this wasn't for enabling button, just consider it as notifying errors
                            if (typeof result !="boolean") {
                                allowThrowMessage(result);
                            }

                            // password/show-strength
                            if (_class.#showStrength) {
                                let passCheck = _this.querySelector(".password");
                                if (passCheck) {
                                    // console.log(passCheck);
                                    if (passCheck.classList.length===2) {
                                        passCheck.classList.remove("password--show")
                                    } else if (passCheck.classList.length===3) {
                                        passCheck.classList.add("password--show");
                                    };
                                }
                            }

                            e.stopPropagation();
                        }
                    )
                    txtbox.addEventListener(
                        "input",
                        function (e) {
                            let _this = findParent(this, "form__field");
                            _this.classList.remove('form__field--invalid');
                            if (this.getAttribute("type")=="password") {
                                if (this.getAttribute("placeholder")=="Password") {
                                    _class.displayStrength(this, _this);
                                    // reset confirm password
                                    $(`#${_class.#formID} #form__text-4`).value = "";
                                    $(`#${_class.#formID} .form__field[data-input="confirm-password"]`).classList.remove("form__field--invalid");
                                } 
                            }
                            let confirm = _class.preCheck();
                            if (confirm) {
                                $(`#${_class.#formID} .form__submit`).classList.add("form__submit--allowed");
                            } else {
                                $(`#${_class.#formID} .form__submit`).classList.remove("form__submit--allowed");
                            }
                            e.stopPropagation();
                        }
                    )
                    txtbox.addEventListener(
                        "keydown",
                        function (e) {
                            // console.log (e.code)
                            if (e.code=="Enter") {
                                _class.switchNextInput(this, e.code, true)
                            } else if (e.code=="ArrowDown") {
                                _class.switchNextInput(this, e.code, false);
                            } else if (e.code=="ArrowUp") {
                                _class.switchPreviousInput(this, e.code, false);
                            }
                        }
                    )
                }
            );
        });
    }

    start() {
        this.handleEvents();
    }

    ok(callback) {
        const _class = this;
        if (this.preCheck()) {
            callback;
            $(`#${_class.#formID} .form__submit button`).disabled = true;
            return true;
        } else {
            $$(`#${_class.#formID} .form__text-real`).forEach(
                function (txtbox)  {
                    let _this = findParent(txtbox, "form__field");
                    _class.validate(txtbox, _this);
                }
            );
        }
    }
    toObject() {
        let _class = this;
        let arrayInput = Array.from($$(`#${this.#formID} .form__field`));
        const trimmedData =  arrayInput.reduce(
            (data, field) => {
                let query = field.getAttribute("data-query");
                let value = field.querySelector("input").value;
                return {...data, [query]: value}
            },
            {}
        );
        delete trimmedData["confirm-password"];
        return trimmedData;
    }
    submit(callback) {
        const _class = this;
        const formTarget = this.#formID;
        document.addEventListener("DOMContentLoaded", function () {
            $(`#${formTarget} .form__submit button`).addEventListener("click", (e)=>{
                if (_class.preCheck()) {
                    console.log ("ddd",_class.toObject());
                    callback(_class.toObject());
                    $(`#${formTarget} .form__submit button`).disabled = true;
                    return true;
                } else {
                    $$(`#${formTarget} .form__text-real`).forEach(
                        function (txtbox)  {
                            let _this = findParent(txtbox, "form__field");
                            _class.validate(txtbox, _this);
                        }
                    );
                }
                e.preventDefault();
                return false;
            });
        });
    }
}




let Regex = {
    email: /^[a-zA-Z0-9._]+[@]{1}[a-z\-0-9]{2,}(?:[.][a-z]{2,})+$/g,
    numberDigit: /[0-9]+/g,
    char: /[a-z]+/g,
    charUp: /[A-Z]+/g,
    special: /[^a-zA-Z0-9]/g
}

/* document.addEventListener("DOMContentLoaded", function () {
    $$('.form__text-real').forEach(
        (txtbox)=>{
            txtbox.addEventListener(
                "focus",
                function (e) {
                    let _this = findParent(this, "form__field");
                    _this.classList.add('form__field--active');
                    
                    if (this.getAttribute("type")=="password") {
                        if (this.getAttribute("placeholder")=="Password") {
                            _this.querySelector(".password").classList.add("password--show");
                        }
                    }
                    e.stopPropagation();
                }
            );
            txtbox.addEventListener(
                "focusout",
                function (e) {
                    let _this = findParent(this, "form__field");
                    _this.classList.remove('form__field--active');
                    formValidation(this, _this);
                    // password/show-strength
                    let passCheck = _this.querySelector(".password");
                    if (passCheck) {
                        // console.log(passCheck);
                        if (passCheck.classList.length===2) {
                            passCheck.classList.remove("password--show")
                        } else if (passCheck.classList.length===3) {
                            passCheck.classList.add("password--show");
                        };
                    }
                    // password/confirm again
                    e.stopPropagation();
                }
            )
            txtbox.addEventListener(
                "input",
                function (e) {
                    let _this = findParent(this, "form__field");
                    _this.classList.remove('form__field--invalid');
                    if (this.getAttribute("type")=="password") {
                        if (this.getAttribute("placeholder")=="Password") {
                            getPasswordStrength(this, _this);
                            // reset confirm password
                            document.querySelector(`#form__text-4`).value = "";
                            $('.form__field[data-input="confirm-password"]').classList.remove("form__field--invalid");
                        } 
                    }
                    let confirm = preCheck();
                    if (confirm) {
                        $('.form__submit').classList.add("form__submit--allowed");
                    } else {
                        $('.form__submit').classList.remove("form__submit--allowed");
                    }
                    e.stopPropagation();
                }
            )
            txtbox.addEventListener(
                "keydown",
                function (e) {
                    console.log (e.code)
                    if (e.code=="Enter") {
                        switchNextInput(this, e, true)
                    } else if (e.code=="ArrowDown") {
                        switchNextInput(this, e, false);
                    } else if (e.code=="ArrowUp") {
                        switchPreviousInput(this, e);
                    }
                }
            )
        }
    )
    $('.form__submit button').addEventListener("click", (e)=>{
        register();
        e.preventDefault();
        
    }) 
}); */
function register() {
    if (preCheck()) {
        processInput();
        $('.form__submit button').disabled = true;
        return true;
    } else {
        $$('.form__text-real').forEach(
            function (txtbox)  {
                let _this = findParent(txtbox, "form__field");
                formValidation(txtbox, _this);
            }
        );
    }
}
function preventInput() {
    $$('.form__text-real').forEach(
        function (txtbox)  {
            txtbox.disabled = true;
        }
    );
}
function processInput() {
    const sub = new Users();
}

