import FormValidation from "./form-validation.js";
// where you import the module
// called by only single line
let objectInput = {
    formID: "form-13888",
    showStrength: true,
}
const login = new FormValidation(objectInput);
login.submit(()=>{});