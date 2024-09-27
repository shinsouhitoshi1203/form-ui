import Users from "./../assets/modules/02.js";

let $ = document.querySelector.bind(document);
let $$ = document.querySelectorAll.bind(document);
let Regex = {
    email: /^[a-zA-Z0-9._]+[@]{1}[a-z\-0-9]{2,}(?:[.][a-z]{2,})+$/g,
    numberDigit: /[0-9]+/g,
    char: /[a-z]+/g,
    charUp: /[A-Z]+/g,
    special: /[^a-zA-Z0-9]/g
}

function findParent( objInput, expectedClass) {
    let o = objInput;
    while (!o.classList.contains(expectedClass)) {
        o = o.parentNode;
    }
    return o;
}

function formValidation(inputText, targetedField, isForShowingButton = false) {
    function throwNewMessage(msg) {
        let msgBox = targetedField.querySelector(".form__field-error-text");
        msgBox.innerText = msg;
        targetedField.classList.add("form__field--invalid");
    }
    let type = targetedField.getAttribute("data-input");
    switch (type) {
        case 'full-name':
            if (inputText.value.length==0) {
                if (isForShowingButton) return false; else throwNewMessage("You have to type your full name");
            }
            break;
        case 'email':
            if (inputText.value.length==0) {
                if (isForShowingButton) return false; else throwNewMessage("You have to type your email");
            } else {
                let email = inputText.value;
                if (!email.match(Regex.email)) {
                    if (isForShowingButton) return false; else throwNewMessage("Please type valid email addresses");
                } 
            }
            break;
        case 'password':
            if (inputText.value.length==0) {
                if (isForShowingButton) return false; else throwNewMessage("You have to type your password");
            }
            break;
        case 'confirm-password':
            if (inputText.value.length==0) {
                if (isForShowingButton) return false; else throwNewMessage("Please repeat the password you typed");
            } else {
                let firstPassword = targetedField.getAttribute("data-from");
                if (inputText.value!=document.querySelector(`#${firstPassword}`)?.value) {
                    if (isForShowingButton) return false; else throwNewMessage("The password you've just typed doesn't match with the password you typed earlier");
                }
            }
            break;
        default:
            throw new Error ("Invalid inputs")
            break;
    }
    return true;
}
function getPasswordStrength(inputText, targetedField) {
    function throwStrong(n=1,msg) {
        let type = ["","weak", "medium", "good", "strong"]
        $$('.s').forEach(s=>s.classList.remove("s-select"));
        for(let i=0;i<=n-1;++i) targetedField.querySelectorAll('.s')[i].classList.add("s-select");
        targetedField.querySelector(".password__text").innerText = msg;
        targetedField.querySelector(".password").setAttribute("class", "password password--show");
        targetedField.querySelector(".password").classList.add(`password--${type[n]}`)
    }
    function hideStrong() {
        targetedField.querySelector(".password").setAttribute("class", "password");
        targetedField.querySelector(".password__text").innerText = "";
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
    let inp = inputText.value;
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
function switchNextInput(inputText, e, isSubmit = false) {
    let targetedField = findParent(inputText, "form__field");
    if (targetedField) {
        targetedField = targetedField.nextElementSibling;
        if (targetedField) {
            targetedField.querySelector("input").focus();
        } else {
            ///// auto submit the form because it is supposed to be the..
            ///// ..last input, its nothing but to submit the form
            if (isSubmit) {
                
                if (register()) {
                    preventInput();
                };
            } 
            
        }
    }
}
function switchPreviousInput(inputText) {
    let targetedField = findParent(inputText, "form__field");
    if (targetedField) {
        targetedField = targetedField.previousElementSibling;
        if (!targetedField) {
            targetedField = $('.form__field:last-of-type');
            targetedField.querySelector("input").focus();
        } else {
            targetedField.querySelector("input").focus();
        }
    }
}
function preCheck() {
    let allCases = [];
    $$('.form__text-real').forEach(
        function (txt)  {
            let _this = findParent(txt, "form__field");
            allCases.push(formValidation(txt,_this,true));
        }
    )
    return allCases.every(e=>e==true);
}
document.addEventListener("DOMContentLoaded", function () {
    $$('.form__text-real').forEach(
        (txtbox)=>{
            txtbox.addEventListener(
                "focus",
                function (e) {
                    let _this = findParent(this, "form__field");
                    _this.classList.remove('form__field--invalid');
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
});
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

